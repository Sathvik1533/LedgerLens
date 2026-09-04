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

from backend.app.api.deps import get_current_reviewer
from backend.app.models.user import UserModel

@router.get(
    "/status",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get status of ingestion feeds and recent batches",
)
def get_ingestion_status(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_reviewer),
):
    from sqlalchemy import select, func
    from backend.app.models.payment import PaymentModel
    from backend.app.models.settlement import SettlementModel
    from backend.app.models.refund import RefundModel
    from backend.app.models.bank_credit import BankCreditModel
    from backend.app.models.ingestion import IngestionBatchModel
    
    pay_count = db.execute(select(func.count()).select_from(PaymentModel)).scalar() or 0
    set_count = db.execute(select(func.count()).select_from(SettlementModel)).scalar() or 0
    ref_count = db.execute(select(func.count()).select_from(RefundModel)).scalar() or 0
    bnk_count = db.execute(select(func.count()).select_from(BankCreditModel)).scalar() or 0
    
    batches = db.execute(
        select(IngestionBatchModel).order_by(IngestionBatchModel.submitted_at.desc()).limit(20)
    ).scalars().all()
    
    return {
        "feeds": {
            "payments": {"name": "Captured Payments", "count": pay_count, "status": "active", "source": "API / Webhook / CSV"},
            "settlements": {"name": "Gateway Settlements", "count": set_count, "status": "active", "source": "Gateway Settlement Batch"},
            "refunds": {"name": "Customer Refunds", "count": ref_count, "status": "active", "source": "Refund Lifecycle Events"},
            "bank_credits": {"name": "Bank Statement Credits", "count": bnk_count, "status": "active", "source": "Core Banking UTR Statement"},
        },
        "batches": [
            {
                "id": str(b.id),
                "idempotency_key": b.idempotency_key,
                "batch_status": b.batch_status,
                "source_filename": b.source_filename,
                "source_tables": b.source_tables,
                "row_count_submitted": b.row_count_submitted,
                "row_count_accepted": b.row_count_accepted,
                "row_count_rejected": b.row_count_rejected,
                "submitted_at": b.submitted_at.isoformat() if b.submitted_at else None,
                "completed_at": b.completed_at.isoformat() if b.completed_at else None,
            }
            for b in batches
        ]
    }
