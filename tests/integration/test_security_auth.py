import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import hash_password, verify_password, PBKDF2_ITERATIONS, SALT_BYTES

client = TestClient(app)

def test_pbkdf2_security_parameters():
    assert PBKDF2_ITERATIONS == 200000
    assert SALT_BYTES == 32
    hashed = hash_password("TestSecretPass123!")
    assert hashed.startswith("pbkdf2_sha256$200000$")
    assert verify_password("TestSecretPass123!", hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_unauthenticated_protected_route_returns_401():
    # Direct access to review queue without session cookie
    response = client.get("/api/v1/review/queue")
    assert response.status_code == 401
    assert "sign in" in response.json()["detail"].lower()

def test_demo_login_and_session_cookie():
    response = client.post("/api/v1/auth/demo", json={"role": "reviewer"})
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "reviewer"
    assert data["email"] == "reviewer@ledgerlens.internal"
    assert "ledgerlens_session" in response.cookies

def test_role_enforcement_reviewer_forbidden_on_admin_endpoint():
    # Login as reviewer
    login_resp = client.post("/api/v1/auth/demo", json={"role": "reviewer"})
    session_cookie = login_resp.cookies.get("ledgerlens_session")
    
    # Attempt admin-only benchmark reset
    headers = {"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"}
    reset_resp = client.post(
        "/api/v1/reconciliation/benchmark/reset",
        cookies={"ledgerlens_session": session_cookie},
        headers=headers,
    )
    assert reset_resp.status_code == 403
    assert "Administrator access is required" in reset_resp.json()["detail"]

def test_admin_benchmark_reset_and_audit_event():
    # Login as admin
    login_resp = client.post("/api/v1/auth/demo", json={"role": "admin"})
    session_cookie = login_resp.cookies.get("ledgerlens_session")
    
    headers = {"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"}
    reset_resp = client.post(
        "/api/v1/reconciliation/benchmark/reset",
        cookies={"ledgerlens_session": session_cookie},
        headers=headers,
    )
    assert reset_resp.status_code == 200
    data = reset_resp.json()
    assert data["status"] == "reset_successful"
    assert data["has_run"] is False
    assert data["actor"] == "admin@ledgerlens.internal"
    assert "audit_event_id" in data

def test_csrf_defense_blocks_non_json_or_missing_custom_header():
    login_resp = client.post("/api/v1/auth/demo", json={"role": "admin"})
    session_cookie = login_resp.cookies.get("ledgerlens_session")
    
    # Omit content-type and custom header on state-changing POST
    bad_resp = client.post(
        "/api/v1/reconciliation/benchmark/reset",
        cookies={"ledgerlens_session": session_cookie},
        headers={"Content-Type": "text/plain"},
    )
    assert bad_resp.status_code == 400
    assert "CSRF" in bad_resp.json()["detail"] or "header" in bad_resp.json()["detail"]

def test_logout_revokes_session():
    login_resp = client.post("/api/v1/auth/demo", json={"role": "reviewer"})
    session_cookie = login_resp.cookies.get("ledgerlens_session")
    
    logout_resp = client.post(
        "/api/v1/auth/logout",
        cookies={"ledgerlens_session": session_cookie},
        headers={"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"},
    )
    assert logout_resp.status_code == 200
    
    # Subsequent call with revoked session should fail with 401
    me_resp = client.get("/api/v1/auth/me", cookies={"ledgerlens_session": session_cookie})
    assert me_resp.status_code == 401
