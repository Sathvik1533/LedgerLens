from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class PaymentRecord(BaseModel):
    payment_id: str
    order_id: str
    merchant_id: str
    payment_type: str = "card"
    payment_method: str = "upi"
    amount: Decimal
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
    gross_payment_amount: Decimal
    refund_amount: Decimal = Decimal('0.00')
    fee_amount: Decimal
    tax_amount: Decimal
    adjustment_amount: Decimal = Decimal('0.00')
    net_settlement_amount: Decimal
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
    credited_amount: Decimal
    currency: str = "INR"
    bank_credit_timestamp: datetime
    bank_credit_status: str = "cleared"
    narration: Optional[str] = None

class RefundRecord(BaseModel):
    refund_id: str
    payment_id: str
    order_id: str
    refund_amount: Decimal
    currency: str = "INR"
    refund_status: str = "processed"
    refund_timestamp: datetime
    refund_type: str = "partial"

class ReconciliationCaseResult(BaseModel):
    case_id: str
    payment_id: str
    order_id: str
    merchant_id: str
    payment_amount: Decimal
    expected_net_settlement: Decimal
    reported_net_settlement: Optional[Decimal] = None
    settlement_discrepancy: Optional[Decimal] = None
    exception_type: Optional[str] = None
    decision_status: str  # auto_reconciled, needs_review, unresolved, blocked
    resolution_reason: Optional[str] = None
    confidence: str  # high, medium, low, unavailable
    matched_settlement_id: Optional[str] = None
    matched_bank_credit_id: Optional[str] = None
    matched_bank_reference: Optional[str] = None
    candidate_matches_count: int = 0
    requires_human_review: bool = False
