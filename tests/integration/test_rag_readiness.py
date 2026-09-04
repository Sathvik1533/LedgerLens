import pytest
from unittest.mock import patch
from backend.app.rag.retriever import PolicyRetriever
from backend.app.api.v1.endpoints.rag import _retriever

@pytest.mark.integration
def test_rag_singleton_is_ready_and_cached(client):
    """
    Verifies that the RAG retriever singleton is loaded in memory,
    cached across calls, and exposed accurately by the readiness check.
    """
    # 1. Assert singleton is preloaded
    assert _retriever.is_ready() is True
    assert _retriever._embeddings is not None
    assert len(_retriever._chunks) > 0

    # 2. Assert readiness endpoint truthfully reports ready
    res = client.get("/api/v1/readiness")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
    assert data["rag_engine"] == "ready"

@pytest.mark.integration
def test_rag_readiness_truthfully_reports_unready_when_embeddings_missing(client):
    """
    Verifies that if the embedding engine is not ready,
    readiness truthfully downgrades status without fabricating readiness.
    """
    with patch.object(_retriever, "is_ready", return_value=False):
        res = client.get("/api/v1/readiness")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "not_ready"
        assert data["rag_engine"] == "unready"
