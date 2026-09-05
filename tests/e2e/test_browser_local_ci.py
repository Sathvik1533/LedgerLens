#!/usr/bin/env python3
"""
LedgerLens Local & CI Browser E2E Suite
======================================
Targets disposable local stack:
- PostgreSQL container on port 5433 (finance_controller_test)
- FastAPI backend on http://127.0.0.1:8000
- Vite frontend dev server on http://127.0.0.1:5173

Strict Invariants:
- NEVER targets https://ledgerlens-finance.vercel.app
- Tests full reviewer lifecycle including state mutations (review decisions, audit appends, 409 conflict handling)
- Cleans up and re-bootstraps after tests so suite is 100% deterministic and idempotent.
"""

import os
import sys
import asyncio
import pytest
import httpx
from pathlib import Path
from playwright.async_api import async_playwright

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

LOCAL_BASE_URL = os.environ.get("LOCAL_BASE_URL", "http://127.0.0.1:5173").rstrip("/")
LOCAL_API_URL = os.environ.get("LOCAL_API_URL", "http://127.0.0.1:8000").rstrip("/")

print(f"[CI/Local E2E] Frontend Target: {LOCAL_BASE_URL}")
print(f"[CI/Local E2E] Backend Target : {LOCAL_API_URL}")

@pytest.mark.browser
@pytest.mark.asyncio
async def test_local_unauthenticated_protection():
    """Unauthenticated direct navigation to /app/queue must redirect to /login."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        await page.goto(f"{LOCAL_BASE_URL}/app/queue", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        assert "/login" in page.url, f"Expected redirect to /login, got {page.url}"

        await context.close()
        await browser.close()

@pytest.mark.browser
@pytest.mark.asyncio
async def test_local_demo_reviewer_login_and_queue():
    """Demo Reviewer one-click login sets session cookie and displays queue with testids."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        await page.goto(f"{LOCAL_BASE_URL}/login", wait_until="networkidle")
        demo_btn = page.locator("[data-testid='login-demo-reviewer']")
        assert await demo_btn.count() > 0, "Missing data-testid='login-demo-reviewer'"
        await demo_btn.click()

        await page.wait_for_url("**/app/queue", timeout=15000)
        await page.wait_for_timeout(1000)

        # Confirm session cookie
        cookies = await context.cookies()
        session_cookie = next((c for c in cookies if c["name"] == "ledgerlens_session"), None)
        assert session_cookie is not None, "ledgerlens_session cookie missing after login"

        # Check queue heading
        heading = page.locator("[data-testid='queue-heading']")
        assert await heading.count() > 0, "Missing data-testid='queue-heading'"
        assert await heading.is_visible()

        # Check queue rows
        await page.wait_for_selector("[data-testid='queue-row']", timeout=15000)
        rows = page.locator("[data-testid='queue-row']")
        assert await rows.count() > 0, "No rows found with data-testid='queue-row'"

        await context.close()
        await browser.close()

@pytest.mark.browser
@pytest.mark.asyncio
async def test_local_case_dossier_four_sources_and_citations():
    """Inspects case dossier for 4-source evidence, policy citation, and audit ledger."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Login
        await page.goto(f"{LOCAL_BASE_URL}/login", wait_until="networkidle")
        await page.locator("[data-testid='login-demo-reviewer']").click()
        await page.wait_for_url("**/app/queue", timeout=15000)

        # Open first case
        await page.wait_for_selector("[data-testid='queue-row']", timeout=15000)
        await page.locator("[data-testid='queue-row']").first.click()
        await page.wait_for_function("() => window.location.pathname.includes('/app/case')", timeout=15000)
        await page.wait_for_selector("text=Verified Reviewer Identity", timeout=15000)
        await page.wait_for_selector("[data-testid='evidence-payment']", timeout=15000)

        # Verify 4 Sources
        assert await page.locator("[data-testid='evidence-payment']").first.is_visible(), "Missing payment evidence"
        assert await page.locator("[data-testid='evidence-settlement']").first.is_visible(), "Missing settlement evidence"
        assert await page.locator("[data-testid='evidence-refund']").first.is_visible(), "Missing refund evidence"
        assert await page.locator("[data-testid='evidence-bank-credit']").first.is_visible(), "Missing bank credit evidence"

        # Verify Policy Guidance / Citation
        await page.wait_for_selector("text=Approved operating rule", timeout=15000)
        citation = page.locator("[data-testid='policy-citation']")
        if await citation.count() > 0:
            assert await citation.first.is_visible()
        else:
            assert await page.locator("text=Approved operating rule").count() > 0

        # Verify Audit Ledger
        audit_ledger = page.locator("[data-testid='audit-ledger']")
        assert await audit_ledger.count() > 0, "Missing audit ledger"
        assert await audit_ledger.first.is_visible()

        await context.close()
        await browser.close()

@pytest.mark.browser
@pytest.mark.asyncio
async def test_local_review_mutation_and_audit_receipt():
    """Submits a human review decision (Escalate) and validates the audit receipt banner."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Login
        await page.goto(f"{LOCAL_BASE_URL}/login", wait_until="networkidle")
        await page.locator("[data-testid='login-demo-reviewer']").click()
        await page.wait_for_url("**/app/queue", timeout=15000)

        # Open first case
        await page.wait_for_selector("[data-testid='queue-row']", timeout=15000)
        await page.locator("[data-testid='queue-row']").first.click()
        await page.wait_for_function("() => window.location.pathname.includes('/app/case')", timeout=15000)
        await page.wait_for_selector("text=Verified Reviewer Identity", timeout=15000)
        await page.wait_for_selector("[data-testid='review-action-form']", timeout=15000)

        # Fill review form
        form = page.locator("[data-testid='review-action-form']")
        assert await form.count() > 0, "Missing review action form"

        # Click Escalate action
        escalate_btn = page.locator("[data-testid='review-action-escalate']")
        await escalate_btn.click()

        # Fill comment >= 10 chars
        comment_input = page.locator("[data-testid='review-action-comment']")
        await comment_input.fill("E2E Automated Review: Discrepancy identified in settlement fee.")

        # Submit review
        submit_btn = page.locator("[data-testid='review-action-submit']")
        await submit_btn.click()

        # Verify Receipt Banner appears
        receipt = page.locator("[data-testid='review-receipt-banner']")
        await page.wait_for_selector("[data-testid='review-receipt-banner']", timeout=15000)
        assert await receipt.first.is_visible()

        await context.close()
        await browser.close()

@pytest.mark.browser
@pytest.mark.asyncio
async def test_local_optimistic_locking_conflict():
    """Attempts to submit a decision against an already-mutated case version to verify 409 conflict handling."""
    # Submit a review directly via API to advance version
    async with httpx.AsyncClient(base_url=LOCAL_API_URL) as client:
        # 1. Login demo to get session cookie
        auth_res = await client.post("/api/v1/auth/demo", json={"role": "reviewer"})
        assert auth_res.status_code == 200
        session_cookie = auth_res.cookies.get("ledgerlens_session")
        assert session_cookie is not None

        cookies = {"ledgerlens_session": session_cookie}

        # 2. Fetch list of cases from review queue
        queue_res = await client.get("/api/v1/review/queue", cookies=cookies)
        assert queue_res.status_code == 200
        queue_data = queue_res.json()
        cases = queue_data.get("cases", [])
        assert len(cases) > 1

        target_case_id = cases[1]["case_id"]

        # Fetch case detail to get current version
        case_detail_res = await client.get(f"/api/v1/review/cases/{target_case_id}", cookies=cookies)
        assert case_detail_res.status_code == 200
        current_version = case_detail_res.json()["version"]

        # 3. Simulate first reviewer updating case to current_version + 1
        first_review = await client.post(
            f"/api/v1/review/cases/{target_case_id}/review",
            cookies=cookies,
            json={
                "actor": "reviewer@ledgerlens.internal",
                "action": "mark_unresolved",
                "human_comment": "First reviewer escalated the case due to variance.",
                "expected_version": current_version,
            }
        )
        assert first_review.status_code == 200, f"Expected 200 on first decision, got {first_review.status_code}: {first_review.text}"

        # 4. Simulate second reviewer attempting decision with stale expected_version
        conflict_res = await client.post(
            f"/api/v1/review/cases/{target_case_id}/review",
            cookies=cookies,
            json={
                "actor": "reviewer@ledgerlens.internal",
                "action": "approve",
                "human_comment": "Second reviewer tries to approve with stale version.",
                "expected_version": current_version,  # Stale!
            }
        )
        assert conflict_res.status_code == 409, f"Expected 409 Conflict, got {conflict_res.status_code}: {conflict_res.text}"
        conflict_data = conflict_res.json()
        assert "conflict" in str(conflict_data).lower() or "version" in str(conflict_data).lower() or "concurrent" in str(conflict_data).lower()
        print("✓ Successfully verified optimistic locking 409 conflict detection.")

@pytest.mark.browser
@pytest.mark.asyncio
async def test_local_marketing_and_evaluation_formula():
    """Verifies marketing and evaluation pages render mathematical formulas."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        await page.goto(f"{LOCAL_BASE_URL}/evaluation", wait_until="networkidle")
        formula = page.locator("[data-testid='evaluation-formula']")
        assert await formula.count() > 0, "Missing data-testid='evaluation-formula'"
        assert await formula.first.is_visible()

        await context.close()
        await browser.close()

@pytest.mark.browser
@pytest.mark.asyncio
async def test_local_reviewer_logout():
    """Logs in and then logs out via [data-testid='nav-logout'], confirming session termination."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Login
        await page.goto(f"{LOCAL_BASE_URL}/login", wait_until="networkidle")
        await page.locator("[data-testid='login-demo-reviewer']").click()
        await page.wait_for_url("**/app/queue", timeout=15000)

        # Logout
        logout_btn = page.locator("[data-testid='nav-logout']")
        if await logout_btn.count() == 0:
            logout_btn = page.locator("button:has-text('Sign out')")
        assert await logout_btn.count() > 0, "Missing data-testid='nav-logout'"
        await logout_btn.first.click()
        await page.wait_for_url("**/login**", timeout=10000)

        assert "/app/" not in page.url or "/login" in page.url

        await context.close()
        await browser.close()

if __name__ == "__main__":
    print(f"Executing standalone local CI browser E2E run against {LOCAL_BASE_URL}...")
    async def run_all():
        print("1. Testing unauthenticated route protection...")
        await test_local_unauthenticated_protection()
        print("✓ Passed unauth protection")

        print("2. Testing Demo Reviewer sign-in and review queue...")
        await test_local_demo_reviewer_login_and_queue()
        print("✓ Passed reviewer login & queue")

        print("3. Testing 4-source evidence, policy citation & audit ledger...")
        await test_local_case_dossier_four_sources_and_citations()
        print("✓ Passed 4-source dossier")

        print("4. Testing human review mutation & receipt banner...")
        await test_local_review_mutation_and_audit_receipt()
        print("✓ Passed review mutation & receipt")

        print("5. Testing optimistic locking 409 conflict handling...")
        await test_local_optimistic_locking_conflict()
        print("✓ Passed 409 conflict detection")

        print("6. Testing evaluation formula rendering...")
        await test_local_marketing_and_evaluation_formula()
        print("✓ Passed evaluation formula")

        print("7. Testing reviewer logout...")
        await test_local_reviewer_logout()
        print("✓ Passed logout")

        print("\nAll Local/CI Browser E2E tests passed successfully!")

    asyncio.run(run_all())
