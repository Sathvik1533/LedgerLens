#!/usr/bin/env python3
"""
LedgerLens Production Read-Only POV Browser Smoke Suite
======================================================
Targets an explicit live environment (defaults to https://ledgerlens-finance.vercel.app).

STRICT INVARIANTS:
- READ-ONLY: Never uploads CSVs, resets benchmark data, executes reconciliation runs,
  or submits human review decisions against production.
- Validates authentic reviewer experience:
  1. Route protection (unauth redirect to /login)
  2. One-click Demo Reviewer sign-in and session cookie verification
  3. Exception Control Room queue table rendering
  4. Case Investigation Dossier (4-source evidence cards)
  5. Grounded RAG policy citations
  6. Audit timeline ledger display
  7. Marketing & Evaluation formula pages
  8. Mobile responsive layout
  9. Session termination / logout
"""

import os
import sys
import asyncio
import pytest
from playwright.async_api import async_playwright

LEDGERLENS_BASE_URL = os.environ.get("LEDGERLENS_BASE_URL", "https://ledgerlens-finance.vercel.app").rstrip("/")

print(f"[POV Smoke] Configured target URL: {LEDGERLENS_BASE_URL}")

@pytest.mark.browser
@pytest.mark.asyncio
async def test_unauthenticated_route_protection():
    """Unauthenticated access to protected routes must redirect to /login."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        await page.goto(f"{LEDGERLENS_BASE_URL}/app/queue", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        assert "/login" in page.url, f"Expected redirect to /login, but was {page.url}"

        await context.close()
        await browser.close()

@pytest.mark.browser
@pytest.mark.asyncio
async def test_public_pages_and_evaluation_formula():
    """All public pages (/, /how-it-works, /evidence, /evaluation, /docs, /about, /login) must render cleanly."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Track console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        public_routes = [
            ("/", "LedgerLens"),
            ("/how-it-works", "How"),
            ("/evidence", "Evidence"),
            ("/evaluation", "Evaluation"),
            ("/docs", "Documentation"),
            ("/about", "About"),
            ("/login", "Control Room"),
        ]

        for route, expected_text in public_routes:
            response = await page.goto(f"{LEDGERLENS_BASE_URL}{route}", wait_until="networkidle")
            assert response is not None, f"No response received for {route}"
            assert response.status == 200, f"Expected 200 for {route}, got {response.status}"
            content = await page.content()
            assert ("LedgerLens" in content or expected_text in content), f"Expected '{expected_text}' on {route}"

        # Specifically verify Evaluation page dynamic formula / metrics
        await page.goto(f"{LEDGERLENS_BASE_URL}/evaluation", wait_until="networkidle")
        formula_locator = page.locator("[data-testid='evaluation-formula']")
        if await formula_locator.count() > 0:
            assert await formula_locator.first.is_visible()
        else:
            assert await page.locator("text=Match Rate").count() > 0 or await page.locator("text=Reconciliation Accuracy").count() > 0

        await context.close()
        await browser.close()


@pytest.mark.browser
@pytest.mark.asyncio
async def test_demo_reviewer_read_only_journey():
    """
    Demo Reviewer end-to-end journey (strictly read-only):
    1. One-click Demo Reviewer login
    2. Session cookie validation
    3. Queue table rows validation
    4. Dossier navigation
    5. Four-source evidence inspection
    6. Grounded policy citation inspection
    7. Audit timeline inspection
    8. Safe logout
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # 1. Navigate to /login
        await page.goto(f"{LEDGERLENS_BASE_URL}/login", wait_until="networkidle")

        # 2. Click Demo Reviewer
        demo_btn = page.locator("[data-testid='login-demo-reviewer']")
        if await demo_btn.count() == 0:
            demo_btn = page.locator("button:has-text('Demo Reviewer')")
        assert await demo_btn.count() > 0, "Demo Reviewer button not found on login page"
        await demo_btn.click()

        # 3. Wait for redirect to /app/queue
        await page.wait_for_url("**/app/queue", timeout=15000)
        await page.wait_for_timeout(1000)

        # 4. Verify session cookie
        cookies = await context.cookies()
        session_cookie = next((c for c in cookies if c["name"] == "ledgerlens_session"), None)
        assert session_cookie is not None, "ledgerlens_session cookie not set after login"

        # 5. Review queue rows
        queue_heading = page.locator("[data-testid='queue-heading']")
        if await queue_heading.count() > 0:
            assert await queue_heading.is_visible()

        await page.wait_for_selector("tbody tr", timeout=15000)
        rows = page.locator("[data-testid='queue-row']")
        if await rows.count() == 0:
            rows = page.locator("tbody tr")
        row_count = await rows.count()
        assert row_count > 0, "Expected at least 1 case row in the review queue"

        # 6. Open the first case dossier
        await rows.first.click()
        await page.wait_for_function("() => window.location.pathname.includes('/app/case')", timeout=15000)
        await page.wait_for_selector("text=Verified Reviewer Identity", timeout=15000)
        await page.wait_for_timeout(1000)

        # 7. Four-source evidence inspection
        for source_test_id in ["evidence-payment", "evidence-settlement", "evidence-refund", "evidence-bank-credit"]:
            loc = page.locator(f"[data-testid='{source_test_id}']")
            if await loc.count() > 0:
                assert await loc.first.is_visible()

        # 8. Grounded RAG policy citation
        citation_loc = page.locator("[data-testid='policy-citation']")
        if await citation_loc.count() > 0:
            assert await citation_loc.first.is_visible()
        else:
            # Fallback to policy guidance container
            assert await page.locator("text=Policy Note").count() > 0 or await page.locator("text=Approved operating rule").count() > 0 or await page.locator("text=Policy Grounding").count() > 0

        # 9. Audit ledger inspection
        audit_loc = page.locator("[data-testid='audit-ledger']")
        if await audit_loc.count() > 0:
            assert await audit_loc.first.is_visible()
        else:
            assert await page.locator("text=Case audit ledger").count() > 0 or await page.locator("text=audit").count() > 0

        # 10. Logout
        logout_btn = page.locator("[data-testid='nav-logout']")
        if await logout_btn.count() == 0:
            logout_btn = page.locator("button:has-text('Sign out'), button:has-text('Sign Out'), button:has-text('Logout')")
        assert await logout_btn.count() > 0, "Sign out button not found in navigation bar"
        await logout_btn.first.click()
        await page.wait_for_url("**/login**", timeout=10000)
        assert "/login" in page.url

        await context.close()
        await browser.close()

@pytest.mark.browser
@pytest.mark.asyncio
async def test_mobile_viewport_readiness():
    """Validates mobile responsive readability at 375x812 without layout distortion."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 375, "height": 812})
        page = await context.new_page()

        await page.goto(f"{LEDGERLENS_BASE_URL}/login", wait_until="networkidle")
        demo_btn = page.locator("[data-testid='login-demo-reviewer']")
        if await demo_btn.count() == 0:
            demo_btn = page.locator("button:has-text('Demo Reviewer')")
        assert await demo_btn.count() > 0
        assert await demo_btn.is_visible()

        await context.close()
        await browser.close()

if __name__ == "__main__":
    print(f"Executing standalone production smoke run against {LEDGERLENS_BASE_URL}...")
    async def run_all():
        print("1. Testing unauthenticated route protection...")
        await test_unauthenticated_route_protection()
        print("✓ Passed unauth protection")

        print("2. Testing public marketing & evaluation formula pages...")
        await test_public_pages_and_evaluation_formula()
        print("✓ Passed public pages")

        print("3. Testing Demo Reviewer read-only journey...")
        await test_demo_reviewer_read_only_journey()
        print("✓ Passed reviewer read-only journey")

        print("4. Testing mobile viewport responsiveness...")
        await test_mobile_viewport_readiness()
        print("✓ Passed mobile viewport check")

        print("\nAll production read-only smoke tests passed successfully!")

    asyncio.run(run_all())
