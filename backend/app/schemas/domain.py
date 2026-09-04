from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class PaymentRecord(BaseModel):
    payment_id: str
    order_id: str = "order_default"
    merchant_id: str = "merch_default"
    payment_type: str = "card"
    payment_method: str = "upi"
    amount: Decimal = Field(..., decimal_places=2, max_digits=18)
    currency: str = "INR"
    status: str = "captured"
    payment_timestamp: datetime
    captured_timestamp: Optional[datetime] = None
    settlement_id: Optional[str] = None
    
    model_config = ConfigDict(arbitrary_types_allowed=True)

class SettlementRecord(BaseModel):
    settlement_id: str
    merchant_id: str
    settlement_type: str = "standard"
    gross_payment_amount: Decimal = Field(..., decimal_places=2, max_digits=18)
    refund_amount: Decimal = Field(Decimal('0.00'), decimal_places=2, max_digits=18)
    fee_amount: Decimal = Field(..., decimal_places=2, max_digits=18)
    tax_amount: Decimal = Field(..., decimal_places=2, max_digits=18)
    adjustment_amount: Decimal = Field(Decimal('0.00'), decimal_places=2, max_digits=18)
    net_settlement_amount: Decimal = Field(..., decimal_places=2, max_digits=18)
    currency: str = "INR"
    settlement_status: str = "processed"
    settlement_timestamp: datetime
    expected_settlement_timestamp: Optional[datetime] = None

class BankCreditRecord(BaseModel):
    bank_credit_id: str
    bank_account_id: str = "ba_0987654321"
    bank_name: str = "HDFC Bank"
    bank_reference: str
    settlement_id: Optional[str] = None
    credited_amount: Decimal = Field(..., decimal_places=2, max_digits=18)
    currency: str = "INR"
    bank_credit_timestamp: datetime
    bank_credit_status: str = "cleared"
    narration: Optional[str] = None

class RefundRecord(BaseModel):
    refund_id: str
    payment_id: str
    order_id: str
    refund_amount: Decimal = Field(..., decimal_places=2, max_digits=18)
    currency: str = "INR"
    refund_status: str = "processed"
    refund_timestamp: datetime
    refund_type: str = "partial"

class ReconciliationCaseResult(BaseModel):
    case_id: str
    payment_id: str
    order_id: str
    merchant_id: str
    payment_amount: Decimal = Field(..., decimal_places=2, max_digits=18)
    expected_net_settlement: Decimal = Field(..., decimal_places=2, max_digits=18)
    reported_net_settlement: Optional[Decimal] = Field(None, decimal_places=2, max_digits=18)
    settlement_discrepancy: Optional[Decimal] = Field(None, decimal_places=2, max_digits=18)
    exception_type: Optional[str] = None
    decision_status: str  # auto_reconciled, needs_review, unresolved, blocked
    resolution_reason: Optional[str] = None
    confidence: str  # high, medium, low, unavailable
    matched_settlement_id: Optional[str] = None
    matched_bank_credit_id: Optional[str] = None
    matched_bank_reference: Optional[str] = None
    candidate_matches_count: int = 0
    requires_human_review: bool = False
