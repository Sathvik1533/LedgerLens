import io
import pytest

from backend.app.models.payment import PaymentModel
from backend.app.models.settlement import SettlementModel, SettlementsRawModel
from backend.app.models.refund import RefundModel, RefundsRawModel
from backend.app.models.bank_credit import BankCreditModel, BankCreditsRawModel
from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel
from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel
from tests.evaluation.generator_fixture import generate_evaluation_dataset


@pytest.mark.evaluation
@pytest.mark.integration
def test_evaluation_ingestion_harness(client, db_session):
    """
    Evaluation Ingestion Harness:
    1. Pre-test emptiness assertions (Strategy D).
    2. Generates deterministic 60-record dataset (+1 invalid payment row).
    3. Ingests all 4 sources via FastAPI HTTP endpoints.
    4. Asserts batch response counts, status codes, and dual-storage persistence.
    """

    # ── 1. Strategy D: Pre-Test Emptiness Assertions ─────────────────────────
    assert db_session.query(PaymentModel).count() == 0
    assert db_session.query(SettlementModel).count() == 0
    assert db_session.query(RefundModel).count() == 0
    assert db_session.query(BankCreditModel).count() == 0
    assert db_session.query(ReconciliationCaseModel).count() == 0
    assert db_session.query(AuditEventModel).count() == 0
    assert db_session.query(HumanReviewActionModel).count() == 0
    assert db_session.query(IngestionBatchModel).count() == 0

    # ── 2. Generate Dataset ──────────────────────────────────────────────────
    csv_streams, meta = generate_evaluation_dataset(total_records=60, seed=42)

    assert meta["total_submitted"] == 61
    assert meta["total_accepted"] == 60
    assert meta["total_rejected"] == 1

    # ── 3. Ingestion: Payments CSV (61 rows: 60 valid + 1 invalid) ───────────
    res_pay = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", io.BytesIO(csv_streams["payments"].encode("utf-8")), "text/csv")},
    )
    assert res_pay.status_code == 201
    pay_data = res_pay.json()
    assert pay_data["row_count_submitted"] == 61
    assert pay_data["row_count_accepted"] == 60
    assert pay_data["row_count_rejected"] == 1
    assert pay_data["batch_status"] == "completed_with_errors"
    assert len(pay_data["errors"]) == 1

    db_session.expire_all()
    assert db_session.query(PaymentsRawModel).filter_by(batch_id=pay_data["batch_id"]).count() == 61
    assert db_session.query(PaymentModel).filter_by(batch_id=pay_data["batch_id"]).count() == 60
    for p in db_session.query(PaymentModel).filter_by(batch_id=pay_data["batch_id"]).all():
        assert p.currency == "INR"

    # ── 4. Ingestion: Settlements CSV ────────────────────────────────────────
    res_set = client.post(
        "/api/v1/ingestion/settlements",
        files={"file": ("settlements.csv", io.BytesIO(csv_streams["settlements"].encode("utf-8")), "text/csv")},
    )
    assert res_set.status_code == 201
    set_data = res_set.json()
    assert set_data["row_count_submitted"] == 58
    assert set_data["row_count_accepted"] == 58
    assert set_data["row_count_rejected"] == 0
    assert set_data["batch_status"] == "completed"

    db_session.expire_all()
    assert db_session.query(SettlementsRawModel).filter_by(batch_id=set_data["batch_id"]).count() == 58
    assert db_session.query(SettlementModel).count() == 58

    # ── 5. Ingestion: Refunds CSV ────────────────────────────────────────────
    res_ref = client.post(
        "/api/v1/ingestion/refunds",
        files={"file": ("refunds.csv", io.BytesIO(csv_streams["refunds"].encode("utf-8")), "text/csv")},
    )
    assert res_ref.status_code == 201
    ref_data = res_ref.json()
    assert ref_data["row_count_submitted"] == 3
    assert ref_data["row_count_accepted"] == 3
    assert ref_data["row_count_rejected"] == 0
    assert ref_data["batch_status"] == "completed"

    db_session.expire_all()
    assert db_session.query(RefundsRawModel).filter_by(batch_id=ref_data["batch_id"]).count() == 3
    assert db_session.query(RefundModel).count() == 3

    # ── 6. Ingestion: Bank Credits CSV ───────────────────────────────────────
    res_bc = client.post(
        "/api/v1/ingestion/bank-credits",
        files={"file": ("bank_credits.csv", io.BytesIO(csv_streams["bank_credits"].encode("utf-8")), "text/csv")},
    )
    assert res_bc.status_code == 201
    bc_data = res_bc.json()
    assert bc_data["row_count_submitted"] == 54
    assert bc_data["row_count_accepted"] == 54
    assert bc_data["row_count_rejected"] == 0
    assert bc_data["batch_status"] == "completed"

    db_session.expire_all()
    assert db_session.query(BankCreditsRawModel).filter_by(batch_id=bc_data["batch_id"]).count() == 54
    assert db_session.query(BankCreditModel).count() == 54
    assert db_session.query(IngestionBatchModel).count() == 4
