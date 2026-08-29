import pytest
from sqlalchemy import select
from backend.app.models.payment import PaymentModel
from backend.app.models.refund import RefundModel
from backend.app.models.settlement import SettlementModel
from backend.app.models.bank_credit import BankCreditModel

@pytest.mark.integration
def test_invalid_payment_amount_scale(client, db_session):
    csv_content = (
        "payment_id,order_id,merchant_id,payment_type,payment_method,amount,currency,status,payment_timestamp\n"
        "pay_1,order_1,m1,card,upi,10.005,INR,captured,2023-01-01T12:00:00Z\n"
    )
    response = client.post("/api/v1/ingestion/payments", files={"file": ("payments.csv", csv_content, "text/csv")})
    assert response.status_code == 201
    data = response.json()
    
    assert data["row_count_accepted"] == 0
    assert data["row_count_rejected"] == 1
    assert "no more than 2 decimal places" in data["errors"][0]["error_message"]
    assert db_session.query(PaymentModel).count() == 0

@pytest.mark.integration
def test_invalid_settlement_amounts_scale(client, db_session):
    # Test gross_payment_amount, fee_amount, tax_amount, net_settlement_amount
    csv_content = (
        "settlement_id,merchant_id,settlement_type,gross_payment_amount,fee_amount,tax_amount,net_settlement_amount,currency,settlement_status,settlement_timestamp\n"
        "set_1,m1,standard,100.0001,2.00,0.36,97.64,INR,processed,2023-01-01T12:00:00Z\n"
    )
    response = client.post("/api/v1/ingestion/settlements", files={"file": ("settlements.csv", csv_content, "text/csv")})
    assert response.status_code == 201
    data = response.json()
    assert data["row_count_accepted"] == 0
    assert data["row_count_rejected"] == 1
    assert "no more than 2 decimal places" in data["errors"][0]["error_message"]
    assert db_session.query(SettlementModel).count() == 0

@pytest.mark.integration
def test_invalid_refund_amount_scale(client, db_session):
    csv_content = (
        "refund_id,payment_id,order_id,refund_amount,currency,refund_status,refund_timestamp,refund_type\n"
        "ref_1,pay_1,order_1,15.555,INR,processed,2023-01-01T12:00:00Z,partial\n"
    )
    response = client.post("/api/v1/ingestion/refunds", files={"file": ("refunds.csv", csv_content, "text/csv")})
    assert response.status_code == 201
    data = response.json()
    assert data["row_count_accepted"] == 0
    assert data["row_count_rejected"] == 1
    assert "no more than 2 decimal places" in data["errors"][0]["error_message"]
    assert db_session.query(RefundModel).count() == 0

@pytest.mark.integration
def test_invalid_bank_credit_amount_scale(client, db_session):
    csv_content = (
        "bank_credit_id,bank_reference,credited_amount,currency,bank_credit_timestamp\n"
        "bc_1,ref_123,999.999,INR,2023-01-01T12:00:00Z\n"
    )
    response = client.post("/api/v1/ingestion/bank-credits", files={"file": ("bank_credits.csv", csv_content, "text/csv")})
    assert response.status_code == 201
    data = response.json()
    assert data["row_count_accepted"] == 0
    assert data["row_count_rejected"] == 1
    assert "no more than 2 decimal places" in data["errors"][0]["error_message"]
    assert db_session.query(BankCreditModel).count() == 0
