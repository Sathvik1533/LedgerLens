"""
SQL Evidence Tool — Read-Only Financial Fact Retrieval
======================================================
Provides structured financial evidence for a reconciliation case
by querying the DB for payment, settlement, and bank credit facts.

Technical invariants:
  - READ-ONLY: This tool only executes SELECT statements.
  - AI does NOT call UPDATE/DELETE — enforced at architecture level (no write session passed).
  - Returns structured dict — not raw SQL — so LLM cannot construct arbitrary queries.
"""

from typing import Optional, Dict, Any
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.models.payment import PaymentModel
from backend.app.models.settlement import SettlementModel
from backend.app.models.bank_credit import BankCreditModel
from backend.app.models.reconciliation import ReconciliationCaseModel


class SQLEvidenceTool:
    """
    Read-only structured fact retrieval for a reconciliation case.
    Returns a dict the LLM can use as grounded financial evidence.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_case_evidence(self, case_id: str) -> Dict[str, Any]:
        """
        Fetches case, payment, settlement, and bank credit facts.
        Returns structured evidence dict for LLM prompt context.
        """
        from uuid import UUID
        try:
            case_uuid = UUID(str(case_id))
        except ValueError:
            return {"error": f"Invalid case_id format: {case_id}"}

        # Fetch case
        case = self.db.execute(
            select(ReconciliationCaseModel).where(ReconciliationCaseModel.id == case_uuid)
        ).scalar_one_or_none()

        if not case:
            return {"error": f"Case {case_id} not found"}

        evidence: Dict[str, Any] = {
            "case_id": str(case.id),
            "payment_id": case.payment_id,
            "exception_type": case.exception_type,
            "decision_status": case.decision_status,
            "expected_net_settlement": str(case.expected_net_settlement) if case.expected_net_settlement else None,
            "reported_net_settlement": str(case.reported_net_settlement) if case.reported_net_settlement else None,
            "settlement_discrepancy": str(case.settlement_discrepancy) if case.settlement_discrepancy else None,
            "currency": case.currency,
            "payment": None,
            "settlement": None,
            "bank_credits": [],
        }

        # Fetch payment
        payment = self.db.execute(
            select(PaymentModel).where(PaymentModel.payment_id == case.payment_id)
        ).scalar_one_or_none()

        if payment:
            evidence["payment"] = {
                "payment_id": payment.payment_id,
                "order_id": payment.order_id,
                "merchant_id": payment.merchant_id,
                "amount": str(payment.amount),
                "currency": payment.currency,
                "status": payment.status,
                "payment_timestamp": payment.payment_timestamp.isoformat() if payment.payment_timestamp else None,
                "settlement_id": payment.settlement_id,
            }

        # Fetch settlement
        if payment and payment.settlement_id:
            settlement = self.db.execute(
                select(SettlementModel).where(SettlementModel.settlement_id == payment.settlement_id)
            ).scalar_one_or_none()

            if settlement:
                evidence["settlement"] = {
                    "settlement_id": settlement.settlement_id,
                    "gross_payment_amount": str(settlement.gross_payment_amount),
                    "fee_amount": str(settlement.fee_amount),
                    "tax_amount": str(settlement.tax_amount),
                    "net_settlement_amount": str(settlement.net_settlement_amount),
                    "settlement_status": settlement.settlement_status,
                    "settlement_timestamp": settlement.settlement_timestamp.isoformat() if settlement.settlement_timestamp else None,
                }

                # Fetch bank credits linked to this settlement
                credits = self.db.execute(
                    select(BankCreditModel).where(
                        BankCreditModel.settlement_id == settlement.settlement_id
                    )
                ).scalars().all()

                evidence["bank_credits"] = [
                    {
                        "bank_credit_id": bc.bank_credit_id,
                        "bank_reference": bc.bank_reference,
                        "credited_amount": str(bc.credited_amount),
                        "bank_credit_status": bc.bank_credit_status,
                        "bank_credit_timestamp": bc.bank_credit_timestamp.isoformat() if bc.bank_credit_timestamp else None,
                    }
                    for bc in credits
                ]

        return evidence
