"""
Gate 5 Integration Tests: Hybrid RAG Investigation
==================================================

Tests cover:
  1. SQL Evidence Tool structured output.
  2. Policy Retriever cosine similarity and grounding floor.
  3. LLM API structured output parsing and retry resilience (mocked).
"""

import pytest
from unittest.mock import MagicMock, patch
from uuid import uuid4
from decimal import Decimal
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.session import get_db
from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.payment import PaymentModel
from backend.app.rag.retriever import PolicyRetriever

client = TestClient(app)

def test_retriever_grounding_floor():
    """Verify retriever strictly enforces the 0.35 similarity grounding floor."""
    retriever = PolicyRetriever()
    retriever.load_corpus()
    
    # Meaningful query should return chunks
    valid_chunks = retriever.retrieve("What is the standard gateway fee rate?", top_k=2)
    assert len(valid_chunks) > 0
    assert valid_chunks[0].similarity_score >= 0.35
    assert "fee" in valid_chunks[0].text.lower() or "policy" in valid_chunks[0].text.lower()
    
    # Nonsense query should fall below floor and return empty list
    nonsense_chunks = retriever.retrieve("How to bake a chocolate cake with strawberries", top_k=3)
    assert len(nonsense_chunks) == 0


@patch("backend.app.rag.assistant.FallbackLLMClient")
def test_rag_investigate_endpoint_success(mock_llm_class):
    """Test full RAG endpoint with mocked LLM ensuring JSON parsing works."""
    # Mock DB response for SQL Tool
    case_id = uuid4()
    mock_db = MagicMock()
    
    case = ReconciliationCaseModel(
        id=case_id,
        payment_id="pay_123",
        exception_type="fee_mismatch",
        decision_status="needs_review",
        currency="INR"
    )
    payment = PaymentModel(
        payment_id="pay_123",
        amount=Decimal("1000.00"),
        currency="INR"
    )
    
    # Setup the mock db to return case then payment then no settlement
    mock_db.execute.return_value.scalar_one_or_none.side_effect = [case, payment, None]
    app.dependency_overrides[get_db] = lambda: mock_db
    
    # Mock LLM Response
    mock_llm_instance = MagicMock()
    mock_llm_instance.invoke.return_value = '''```json
{
  "summary": "Gateway fee charged was 3% instead of 2%.",
  "root_cause_analysis": "The expected fee was 20.00 but 30.00 was charged.",
  "recommended_action": "Contact gateway support to correct the tier.",
  "citations": [{"source_file": "fee_policy.md", "quote": "Standard gateway fee: 2% of gross payment amount."}],
  "is_confident": true
}
```'''
    mock_llm_class.return_value = mock_llm_instance

    res = client.post(f"/api/v1/rag/investigate/{case_id}")
    assert res.status_code == 200
    
    data = res.json()
    assert data["summary"] == "Gateway fee charged was 3% instead of 2%."
    assert len(data["citations"]) == 1
    assert data["citations"][0]["source_file"] == "fee_policy.md"
    assert data["is_confident"] is True
    
    app.dependency_overrides.clear()
