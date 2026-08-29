import os
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.db.session import get_db
from backend.app.rag.retriever import PolicyRetriever
from backend.app.rag.tools.sql_tool import SQLEvidenceTool
from backend.app.rag.assistant import InvestigationAssistant, InvestigationResult

router = APIRouter()

# Global retriever instance to avoid reloading embeddings on every request
_retriever = PolicyRetriever()
_retriever.load_corpus()

@router.post(
    "/investigate/{case_id}",
    response_model=InvestigationResult,
    status_code=status.HTTP_200_OK,
    summary="Run AI RAG investigation on a reconciliation case",
    description="Combines SQL evidence and semantic policy search to provide a structured explanation and recommendation for a discrepancy."
)
def run_investigation(
    case_id: UUID = Path(..., description="UUID of the reconciliation case"),
    db: Session = Depends(get_db),
):
    sql_tool = SQLEvidenceTool(db)
    
    # We require GROQ_API_KEY in the environment for this to succeed using ChatGroq
    if not os.environ.get("GROQ_API_KEY") and not os.environ.get("GEMINI_API_KEY"):
        # For testing purposes without a real key, return a mock response
        # In a real environment, this would just fail. We'll raise a 503 so tests can handle it or mock the LLM
        pass
        
    try:
        assistant = InvestigationAssistant(sql_tool=sql_tool, retriever=_retriever)
        result = assistant.investigate_case(str(case_id))
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
