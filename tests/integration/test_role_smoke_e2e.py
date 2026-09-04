import uuid
from decimal import Decimal
import pytest
from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import AuditEventModel
from tests.integration.test_review_concurrency_race_conditions import _seed_needs_review_case
from tests.conftest import TestingSessionLocal

@pytest.mark.integration
def test_anonymous_visitor_public_access_and_rejection_of_protected_routes(client):
    """
    Smoke Test: Anonymous Visitor
    - Public metadata endpoints are accessible without credentials.
    - All operational, case, review, and admin routes strictly return 401.
    - Zero sensitive financial rows, cases, or audit logs exposed.
    """
    # Public endpoints
    h_res = client.get("/api/v1/health")
    assert h_res.status_code == 200
    assert h_res.json()["service"] == "LedgerLens"

    r_res = client.get("/api/v1/readiness")
    assert r_res.status_code == 200
    assert r_res.json()["status"] == "ready"

    o_res = client.get("/api/v1/openapi.json")
    assert o_res.status_code == 200
    assert o_res.json()["info"]["title"] == "LedgerLens"

    # Protected routes return 401
    fake_case_id = uuid.uuid4()
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/reconciliation/cases").status_code == 401
    assert client.get(f"/api/v1/review/cases/{fake_case_id}").status_code == 401
    assert client.post(f"/api/v1/rag/investigate/{fake_case_id}").status_code == 401
    assert client.post(
        f"/api/v1/review/cases/{fake_case_id}/review",
        json={"action": "approve", "expected_version": 1, "human_comment": "Short"},
        headers={"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"}
    ).status_code == 401
    assert client.post(
        "/api/v1/reconciliation/benchmark/reset",
        json={"reason": "reset"},
        headers={"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"}
    ).status_code == 401
    assert client.get("/api/v1/ingestion/status").status_code == 401

@pytest.mark.integration
def test_demo_reviewer_lifecycle_evidence_dossier_and_review(client, db_session):
    """
    Smoke Test: Demo Reviewer
    - Login succeeds with reviewer role and session cookie.
    - Review queue loads, filters, and searches work.
    - Case dossier opens with linked evidence.
    - Invalid short rationale (<10 chars) is blocked.
    - Valid review succeeds and writes audit trail in isolated test DB.
    - Admin-only endpoints return 403 Forbidden.
    """
    # 1. Login as Reviewer
    login_res = client.post("/api/v1/auth/demo", json={"role": "reviewer"})
    assert login_res.status_code == 200
    reviewer_cookie = login_res.cookies.get("ledgerlens_session")
    assert reviewer_cookie is not None
    assert login_res.json()["role"] == "reviewer"
    assert login_res.json()["full_name"] == "Demo Reviewer"

    auth_cookies = {"ledgerlens_session": reviewer_cookie}
    csrf_headers = {"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"}

    # 2. Verify identity
    me_res = client.get("/api/v1/auth/me", cookies=auth_cookies)
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "reviewer"
    assert me_res.json()["email"] == "reviewer@ledgerlens.internal"

    # 3. Seed case in needs_review state
    case_id = _seed_needs_review_case(db_session)

    # 4. Review queue loads
    queue_res = client.get("/api/v1/reconciliation/cases", cookies=auth_cookies)
    assert queue_res.status_code == 200
    cases = queue_res.json()
    assert any(str(c["id"]) == str(case_id) for c in cases)

    # Filter queue by status
    filtered_res = client.get("/api/v1/reconciliation/cases?status=needs_review", cookies=auth_cookies)
    assert filtered_res.status_code == 200

    # 5. Case dossier opens with evidence
    dossier_res = client.get(f"/api/v1/review/cases/{case_id}", cookies=auth_cookies)
    assert dossier_res.status_code == 200
    dossier = dossier_res.json()
    assert dossier["case_id"] == str(case_id)
    assert dossier["decision_status"] == "needs_review"
    assert dossier["version"] == 1
    assert "payment_id" in dossier

    # 6. Short rationale (<10 chars) rejected with 400
    short_res = client.post(
        f"/api/v1/review/cases/{case_id}/review",
        json={
            "actor": "reviewer@ledgerlens.internal",
            "action": "approve",
            "human_comment": "Too short",
            "expected_version": 1
        },
        cookies=auth_cookies,
        headers=csrf_headers,
    )
    assert short_res.status_code in [400, 422]
    error_detail = str(short_res.json()["detail"])
    assert "10" in error_detail or "characters" in error_detail or "length" in error_detail

    # 7. Valid review submission succeeds
    valid_res = client.post(
        f"/api/v1/review/cases/{case_id}/review",
        json={
            "actor": "reviewer@ledgerlens.internal",
            "action": "approve",
            "human_comment": "Verified against gateway settlement journal.",
            "expected_version": 1
        },
        cookies=auth_cookies,
        headers=csrf_headers,
    )
    assert valid_res.status_code == 200
    valid_data = valid_res.json()
    assert valid_data["new_decision_status"] == "auto_reconciled"
    assert valid_data["current_version"] == 2
    assert "audit_event_id" in valid_data

    # 8. Admin-only endpoint forbidden to reviewer
    admin_blocked = client.post(
        "/api/v1/reconciliation/benchmark/reset",
        json={"reason": "unauthorized reset"},
        cookies=auth_cookies,
        headers=csrf_headers,
    )
    assert admin_blocked.status_code == 403

@pytest.mark.integration
def test_demo_administrator_controls_and_benchmark_reset(client, db_session):
    """
    Smoke Test: Demo Administrator
    - Login succeeds with admin role.
    - Admin identity and role are visible.
    - Administrator-only benchmark reset is authorized and creates audit event.
    """
    # 1. Login as Admin
    login_res = client.post("/api/v1/auth/demo", json={"role": "admin"})
    assert login_res.status_code == 200
    admin_cookie = login_res.cookies.get("ledgerlens_session")
    assert admin_cookie is not None
    assert login_res.json()["role"] == "admin"
    assert login_res.json()["full_name"] == "Demo Administrator"

    auth_cookies = {"ledgerlens_session": admin_cookie}
    csrf_headers = {"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"}

    # 2. Verify identity
    me_res = client.get("/api/v1/auth/me", cookies=auth_cookies)
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "admin"
    assert me_res.json()["email"] == "admin@ledgerlens.internal"

    # 3. Perform benchmark reset
    reset_res = client.post(
        "/api/v1/reconciliation/benchmark/reset",
        json={"reason": "End-to-end admin smoke verification"},
        cookies=auth_cookies,
        headers=csrf_headers,
    )
    assert reset_res.status_code == 200
    reset_data = reset_res.json()
    assert reset_data["status"] == "reset_successful"
    assert reset_data["has_run"] is False
    assert reset_data["actor"] == "admin@ledgerlens.internal"
    assert "audit_event_id" in reset_data

    # Verify audit event in test DB
    with TestingSessionLocal() as db:
        audit = db.query(AuditEventModel).filter(AuditEventModel.event_type == "benchmark_reset").first()
        assert audit is not None
        assert audit.actor == "admin@ledgerlens.internal"
