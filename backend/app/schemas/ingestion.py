from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class RowValidationError(BaseModel):
    source_row_index: int
    field: Optional[str] = None
    error_message: str
    raw_value: Optional[str] = None

class IngestionBatchResponse(BaseModel):
    batch_id: UUID
    idempotency_key: str
    batch_status: str
    source_filename: Optional[str] = None
    row_count_submitted: int
    row_count_accepted: int
    row_count_rejected: int
    errors: List[RowValidationError] = Field(default_factory=list)
    submitted_at: datetime
    completed_at: Optional[datetime] = None
    is_duplicate: bool = False
