import os
import json
import re
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.app.rag.retriever import PolicyRetriever
from backend.app.rag.tools.sql_tool import SQLEvidenceTool


class Citation(BaseModel):
    source_file: str = Field(..., description="The name of the policy file")
    quote: str = Field(..., description="The exact quote from the policy")


def _sanitize_plain_text(text: str) -> str:
    """
    Conservative plain-text sanitizer:
    Strips markdown hashtag headings, bold/italic markers, and code blocks
    while strictly preserving currency symbols (₹), punctuation, quotes,
    numbers, and source references.
    """
    if not text:
        return ""
    # Safely remove markdown header prefixes (#, ##, ###) at the start of lines
    clean = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
    # Remove markdown bold/italic asterisks while preserving the inner text
    clean = re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', clean)
    # Remove code fences
    clean = re.sub(r'```[a-zA-Z]*\n?', '', clean)
    clean = re.sub(r'```', '', clean)
    # Normalize excessive blank lines
    clean = re.sub(r'\n{3,}', '\n\n', clean)
    return clean.strip()


class InvestigationResult(BaseModel):
    summary: str = Field(..., description="1-2 sentence summary of the issue in clean plain text")
    root_cause_analysis: str = Field(..., description="Detailed explanation in clean plain text")
    recommended_action: str = Field(..., description="Clear next steps for the ops reviewer in clean plain text")
    citations: List[Citation] = Field(..., description="List of policy citations used in reasoning")
    is_confident: bool = Field(..., description="True if the LLM is highly confident in its assessment")



class BaseLLMClient:
    """Base class for LLM clients to allow easy swapping and fallback."""
    def invoke(self, system_prompt: str, user_content: str) -> str:
        raise NotImplementedError()


class GeminiLLMClient(BaseLLMClient):
    """Primary Provider: Google Gemini (Ox Alpha class reasoning)."""
    def __init__(self, model_name: str = "gemini-1.5-pro"):
        self.model_name = model_name
        self.api_key = os.environ.get("GEMINI_API_KEY", "")

    def invoke(self, system_prompt: str, user_content: str) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not set")
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        
        # Combine system and user prompt for Gemini's generic endpoint
        full_prompt = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER INPUT:\n{user_content}"
        
        data = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {"temperature": 0.0}
        }
        
        req = urllib.request.Request(url, json.dumps(data).encode("utf-8"), headers)
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                return result["candidates"][0]["content"]["parts"][0]["text"]
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"Gemini API Error: {e.read().decode()}")


class GroqLLMClient(BaseLLMClient):
    """Fallback Provider: Groq / LLaMA-3 (Ultra-fast failover)."""
    def __init__(self, model_name: str = "llama3-70b-8192"):
        self.model_name = model_name
        self.api_key = os.environ.get("GROQ_API_KEY", "")

    def invoke(self, system_prompt: str, user_content: str) -> str:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not set")
            
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "temperature": 0.0
        }
        
        req = urllib.request.Request(url, json.dumps(data).encode("utf-8"), headers)
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                return result["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"Groq API Error: {e.read().decode()}")


class FallbackLLMClient(BaseLLMClient):
    """
    Enterprise HA Router: Attempts clients in order.
    If the primary fails (e.g., rate limit, downtime), it transparently fails over to the next.
    """
    def __init__(self, clients: List[BaseLLMClient]):
        self.clients = clients

    def invoke(self, system_prompt: str, user_content: str) -> str:
        errors = []
        for client in self.clients:
            try:
                return client.invoke(system_prompt, user_content)
            except Exception as e:
                # Log error and continue to next provider
                errors.append(f"{client.__class__.__name__}: {str(e)}")
                continue
                
        raise RuntimeError(f"All LLM providers failed. Errors: {errors}")


class InvestigationAssistant:
    def __init__(self, sql_tool: SQLEvidenceTool, retriever: PolicyRetriever):
        self.sql_tool = sql_tool
        self.retriever = retriever
        
        # Build the HA Fallback Chain
        # Primary: Google Gemini 1.5 Pro (Highest Reasoning)
        # Fallback: Groq LLaMA-3 70B (Fast Backup)
        self.llm = FallbackLLMClient(clients=[
            GeminiLLMClient(),
            GroqLLMClient()
        ])

    def investigate_case(self, case_id: str) -> InvestigationResult:
        """
        End-to-end investigation workflow:
        1. Fetch SQL facts
        2. Query vector DB with facts
        3. Prompt LLM for structured output
        4. Validate citation formatting (guardrails)
        """
        # 1. Fetch exact SQL facts
        evidence = self.sql_tool.get_case_evidence(case_id)
        if "error" in evidence:
            raise ValueError(evidence["error"])
            
        exception_type = evidence.get("exception_type", "unknown")

        # 2. Retrieve relevant policy chunks based on the exception type
        query = f"Policy for exception: {exception_type}"
        chunks = self.retriever.retrieve(query, top_k=3)
        
        policy_context = ""
        for i, chunk in enumerate(chunks):
            policy_context += f"--- Document {i+1}: {chunk.source_file} (Lines {chunk.line_start}-{chunk.line_end}) ---\n"
            policy_context += f"{chunk.text}\n\n"

        if not policy_context.strip():
            policy_context = "No relevant policy documents found above the grounding floor."

        # 3. Construct the prompt
        system_prompt = """You are an AI Finance Investigation Assistant.
Your task is to analyze a reconciliation discrepancy and provide clear, plain-language guidance for a finance reviewer.

CRITICAL PLAIN-TEXT RULE:
- Return clean plain text. Do NOT use markdown hashtag headings (#, ##, ###), markdown tables, code blocks, or raw JSON formatting inside string values.
- Write in short, clear sentences. Explain one idea at a time.
- State: What happened, Why it matters, and What to do next.
- Retain exact rupee amounts (₹) and percentages without modification.
- Ground your analysis strictly in the provided SQL Evidence and Policy.
- Never invent or guess numbers.
"""

        user_content = f"""
SQL EVIDENCE:
{json.dumps(evidence, indent=2)}

RELEVANT POLICY RULES:
{policy_context}

Analyze the discrepancy and provide a JSON response with the following keys:
- "summary": A brief 1-2 sentence plain-language summary of what happened.
- "root_cause_analysis": A step-by-step plain-language explanation of why the numbers disagree.
- "recommended_action": A clear next step for the human reviewer to resolve the discrepancy.
- "citations": A list of objects with "source_file" and "quote" (exact short excerpt from policy).
- "is_confident": boolean (true/false)

Return ONLY valid JSON.
"""

        # 4. Execute LLM call with bounded retry
        max_retries = 3
        for attempt in range(max_retries):
            try:
                raw_text = self.llm.invoke(system_prompt, user_content)
                
                # Parse JSON
                raw_text = raw_text.strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                    
                data = json.loads(raw_text.strip())
                
                # Conservative sanitization to guarantee plain text
                sanitized_summary = _sanitize_plain_text(data.get("summary", ""))
                sanitized_rc = _sanitize_plain_text(data.get("root_cause_analysis", ""))
                sanitized_rec = _sanitize_plain_text(data.get("recommended_action", ""))

                result = InvestigationResult(
                    summary=sanitized_summary,
                    root_cause_analysis=sanitized_rc,
                    recommended_action=sanitized_rec,
                    citations=[Citation(**c) for c in data.get("citations", [])],
                    is_confident=data.get("is_confident", True)
                )
                
                # Basic guardrail: Verify citations actually exist in the retrieved chunks
                for citation in result.citations:
                    found = False
                    for chunk in chunks:
                        if citation.source_file in chunk.source_file:
                            clean_quote = re.sub(r'\s+', ' ', citation.quote.lower())
                            clean_text = re.sub(r'\s+', ' ', chunk.text.lower())
                            if clean_quote in clean_text or clean_text in clean_quote:
                                found = True
                                break
                    if not found and result.is_confident:
                        result.is_confident = False
                        
                return result
                
            except Exception as e:
                if attempt == max_retries - 1:
                    # Grounded Deterministic Fallback in clear plain language
                    policy_citations = [
                        Citation(
                            source_file=c.source_file,
                            quote=c.text[:220].strip() + ("..." if len(c.text) > 220 else "")
                        )
                        for c in chunks[:2]
                    ]
                    
                    discrepancy = evidence.get("settlement_discrepancy", "0.00")
                    exp_net = evidence.get("expected_net_settlement", "0.00")
                    rep_net = evidence.get("reported_net_settlement", "0.00")
                    
                    if exception_type == "amount_mismatch":
                        rc = f"The payment was captured, but the gateway remitted ₹{rep_net} instead of the expected ₹{exp_net}. The unexplained difference is ₹{abs(float(discrepancy)):.2f}."
                        rec = "Verify the gateway deduction schedule and demand a credit adjustment or approve an authorized fee waiver."
                    elif exception_type == "missing_settlement":
                        rc = "The payment was successfully captured on the storefront, but the gateway payout batch omitted this transaction."
                        rec = "Escalate to the payment gateway operations desk for batch re-transmission and settlement."
                    elif exception_type == "missing_bank_credit":
                        rc = "The gateway reported settlement confirmation, but no matching credit UTR was deposited in the bank account."
                        rec = "Initiate a bank statement trace with banking operations to confirm deposit clearing."
                    elif exception_type == "duplicate_payment":
                        rc = "Two separate captured payments share the same customer order identifier."
                        rec = "Inspect authorization records and initiate a customer reversal refund for the duplicate capture."
                    elif exception_type == "duplicate_bank_credit":
                        rc = "The bank statement records two credits for the same settlement batch."
                        rec = "Audit the bank statement journal and verify whether a shadow credit was posted."
                    elif exception_type == "partial_refund_not_reflected":
                        rc = "A customer refund was completed, but the gateway payout calculation did not adjust for the refunded amount."
                        rec = "Adjust the ledger balance to recover the unadjusted refund in the upcoming settlement cycle."
                    else:
                        rc = f"This record requires manual inspection under exception category: {exception_type.replace('_', ' ')}."
                        rec = "Review the four counterparty records and apply the governing operating procedure."

                    return InvestigationResult(
                        summary=f"Operating policy guidance for {exception_type.replace('_', ' ')}",
                        root_cause_analysis=_sanitize_plain_text(rc),
                        recommended_action=_sanitize_plain_text(rec),
                        citations=policy_citations,
                        is_confident=len(policy_citations) > 0
                    )
