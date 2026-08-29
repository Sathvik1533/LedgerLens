from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Header, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.ingestion import IngestionBatchResponse
from backend.app.services.ingestion_service import IngestionService

router = APIRouter()

@router.post(
    "/payments",
    response_model=IngestionBatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest payments CSV",
)
async def ingest_payments_csv(
    file: UploadFile = File(...),
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file format. Only .csv files are supported.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    service = IngestionService(db)
    try:
        return service.process_payment_csv(file_content=content, filename=file.filename, custom_idempotency_key=x_idempotency_key)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post(
    "/settlements",
    response_model=IngestionBatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest settlements CSV",
)
async def ingest_settlements_csv(
    file: UploadFile = File(...),
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file format. Only .csv files are supported.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    service = IngestionService(db)
    try:
        return service.process_settlement_csv(file_content=content, filename=file.filename, custom_idempotency_key=x_idempotency_key)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post(
    "/refunds",
    response_model=IngestionBatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest refunds CSV",
)
async def ingest_refunds_csv(
    file: UploadFile = File(...),
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file format. Only .csv files are supported.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    service = IngestionService(db)
    try:
        return service.process_refund_csv(file_content=content, filename=file.filename, custom_idempotency_key=x_idempotency_key)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post(
    "/bank-credits",
    response_model=IngestionBatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest bank credits CSV",
)
async def ingest_bank_credits_csv(
    file: UploadFile = File(...),
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file format. Only .csv files are supported.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    service = IngestionService(db)
    try:
        return service.process_bank_credit_csv(file_content=content, filename=file.filename, custom_idempotency_key=x_idempotency_key)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
