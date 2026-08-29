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


class InvestigationResult(BaseModel):
    summary: str = Field(..., description="1-2 sentence summary of the issue")
    root_cause_analysis: str = Field(..., description="Detailed explanation of the discrepancy")
    recommended_action: str = Field(..., description="Clear next steps for the ops team")
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
        system_prompt = """You are an expert AI Finance Controller. 
Your task is to analyze a reconciliation discrepancy and provide a clear, structured investigation report.

You will be provided with:
1. SQL EVIDENCE: The exact financial facts from the database.
2. RAG POLICY: Relevant excerpts from the company's financial policies.

RULES:
- You must base your reasoning STRICTLY on the provided SQL Evidence and RAG Policy.
- NEVER invent or hallucinate financial numbers.
- If the policy does not explicitly cover the scenario, state that your confidence is low.
- Provide your output in exact JSON format matching the requested schema.
"""

        user_content = f"""
### SQL EVIDENCE ###
{json.dumps(evidence, indent=2)}

### RAG POLICY ###
{policy_context}

Analyze the above data and provide a JSON response with the following keys:
- "summary": A brief 1-2 sentence summary of what went wrong.
- "root_cause_analysis": A detailed step-by-step explanation of the numbers and why the exception was raised.
- "recommended_action": What the human operations team should do to fix it.
- "citations": A list of objects, each with "source_file" (e.g., fee_policy.md) and "quote" (an exact excerpt from the policy text you relied on).
- "is_confident": boolean (true/false)

Return ONLY valid JSON. No markdown formatting blocks around it.
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
                
                result = InvestigationResult(**data)
                
                # Basic guardrail: Verify citations actually exist in the retrieved chunks
                for citation in result.citations:
                    found = False
                    for chunk in chunks:
                        if citation.source_file in chunk.source_file:
                            # Normalize whitespace for flexible checking
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
                    # Fallback on complete failure
                    return InvestigationResult(
                        summary="AI Investigation Failed",
                        root_cause_analysis=f"The AI assistant encountered an error after {max_retries} attempts: {str(e)}",
                        recommended_action="Manual investigation required.",
                        citations=[],
                        is_confident=False
                    )
