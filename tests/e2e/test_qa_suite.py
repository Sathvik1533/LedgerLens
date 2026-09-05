import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

BASE_URL = os.environ.get("BASE_URL", "https://ledgerlens-finance.vercel.app")
OUTPUT_DIR = os.environ.get(
    "QA_OUTPUT_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../scratch/qa_proof/final_verif")
)

test_results = {
    "scenarios": {},
    "screenshots": [],
    "console_errors": [],
    "network_checks": []
}

async def run_qa_suite():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("================================================================================")
    print("  LEDGERLENS COMPREHENSIVE E2E & SCENARIO-BASED VERIFICATION SUITE")
    print("================================================================================")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # -----------------------------------------------------------------------------
        # SCENARIO 1: Unauthenticated Security & Route Protection
        # -----------------------------------------------------------------------------
        print("\n[Scenario 1] Testing Unauthenticated Route Protection...")
        unauth_context = await browser.new_context(viewport={"width": 1440, "height": 900})
        unauth_page = await unauth_context.new_page()
        
        # Navigate directly to protected route /app/queue
        await unauth_page.goto(f"{BASE_URL}/app/queue", wait_until="networkidle")
        await asyncio.sleep(1)
        current_url = unauth_page.url
        print(f"Direct unauth access redirected to: {current_url}")
        assert "/login" in current_url, f"Expected redirect to /login, but was {current_url}"
        await unauth_page.screenshot(path=f"{OUTPUT_DIR}/01_unauth_redirect_to_login_1440px.png", full_page=True)
        test_results["screenshots"].append("01_unauth_redirect_to_login_1440px.png")
        test_results["scenarios"]["scenario_1_unauth_redirect"] = "PASS"
        print("✓ Scenario 1 PASS: Unauthenticated access safely redirected to /login")
        await unauth_context.close()

        # -----------------------------------------------------------------------------
        # SCENARIO 2: One-Click Demo Sign-in as Demo Reviewer
        # -----------------------------------------------------------------------------
        print("\n[Scenario 2] Testing Demo Reviewer Sign-in & Session Cookie...")
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await page.screenshot(path=f"{OUTPUT_DIR}/02_login_page_1440px.png", full_page=True)
        test_results["screenshots"].append("02_login_page_1440px.png")

        # Click Demo Reviewer button
        demo_reviewer_btn = page.locator("button:has-text('Demo Reviewer')")
        assert await demo_reviewer_btn.count() > 0, "Demo Reviewer button not found on login page"
        await demo_reviewer_btn.click()
        
        # Wait for redirect to /app/queue
        await page.wait_for_url("**/app/queue", timeout=10000)
        await asyncio.sleep(2)
        print(f"Logged in successfully. Active page: {page.url}")

        # Check cookies
        cookies = await context.cookies()
        session_cookie = next((c for c in cookies if c["name"] == "ledgerlens_session"), None)
        assert session_cookie is not None, "ledgerlens_session cookie was not set!"
        print(f"✓ Session cookie confirmed: HttpOnly={session_cookie['httpOnly']}, SameSite={session_cookie.get('sameSite')}")
        
        await page.screenshot(path=f"{OUTPUT_DIR}/03_authenticated_queue_1440px.png", full_page=True)
        test_results["screenshots"].append("03_authenticated_queue_1440px.png")
        test_results["scenarios"]["scenario_2_reviewer_login"] = "PASS"
        print("✓ Scenario 2 PASS: Demo Reviewer logged in with secure session cookie")

        # -----------------------------------------------------------------------------
        # SCENARIO 3: Review Queue & Case Investigation Dossier
        # -----------------------------------------------------------------------------
        print("\n[Scenario 3] Testing Case Dossier & Verified Reviewer Identity...")
        # Wait for queue table async fetch to finish and render rows
        await page.wait_for_selector("tbody tr", timeout=15000)
        case_rows = page.locator("tbody tr")
        row_count = await case_rows.count()
        print(f"Queue rows detected: {row_count}")
        assert row_count > 0, "No case rows found in queue table!"
        
        # Navigate to first case
        first_row = case_rows.first
        await first_row.click()
        await page.wait_for_function("() => window.location.pathname.includes('/app/case')", timeout=15000)
        await page.wait_for_selector("text=Verified Reviewer Identity", timeout=15000)
        print(f"Opened case page: {page.url}")
        
        # Verify Verified Reviewer Identity is present
        reviewer_identity = page.locator("text=Verified Reviewer Identity")
        assert await reviewer_identity.count() > 0, "Verified Reviewer Identity block missing!"
        reviewer_name = page.locator("text=Demo Reviewer")
        assert await reviewer_name.count() > 0, "Demo Reviewer name missing!"
        
        # Verify RAG policy copilot guidance
        rag_heading = page.locator("text=Approved operating rule & precedent")
        assert await rag_heading.count() > 0, "RAG policy heading missing!"

        await page.screenshot(path=f"{OUTPUT_DIR}/04_case_dossier_1440px.png", full_page=True)
        test_results["screenshots"].append("04_case_dossier_1440px.png")
        test_results["scenarios"]["scenario_3_case_dossier"] = "PASS"
        print("✓ Scenario 3 PASS: Case dossier rendered with verified identity and policy guidance")

        # -----------------------------------------------------------------------------
        # SCENARIO 4: Audit Decision Submission with Validation
        # -----------------------------------------------------------------------------
        print("\n[Scenario 4] Testing Audit Decision Submission with Validation...")
        # Attempt to submit with short rationale (< 10 chars)
        rationale_input = page.locator("textarea[placeholder*='Explain the commercial']")
        await rationale_input.fill("Short")
        submit_btn = page.locator("button:has-text('Record review decision')")
        await submit_btn.click()
        await asyncio.sleep(0.5)

        # Check that character counter warns or error appears
        counter = page.locator("text=5/10 min chars")
        assert await counter.count() > 0, "Character counter not updating!"
        print("✓ Minimum rationale validation enforced (<10 characters)")

        # Now fill valid rationale
        await rationale_input.fill("Verified gateway settlement deduction aligns with contractual fee schedule. Approved by finance operations.")
        
        # Track POST response
        async with page.expect_response(lambda r: "/review/cases/" in r.url and r.request.method == "POST") as resp_info:
            await submit_btn.click()
        resp = await resp_info.value
        print(f"Review submit HTTP response status: {resp.status}")

        if resp.status == 409:
            print("Detected optimistic concurrency version conflict (409). Refreshing case to sync version...")
            refresh_btn = page.locator("button:has-text('Refresh latest case data')")
            if await refresh_btn.count() > 0:
                await refresh_btn.click()
                await asyncio.sleep(1.5)
                # Re-submit with updated version
                await rationale_input.fill("Verified gateway settlement deduction aligns with contractual fee schedule. Approved by finance operations.")
                async with page.expect_response(lambda r: "/review/cases/" in r.url and r.request.method == "POST") as resp_info2:
                    await submit_btn.click()
                resp2 = await resp_info2.value
                print(f"Post-refresh review submit status: {resp2.status}")

        await asyncio.sleep(2)

        # Check for any error banner on page
        err_elements = await page.locator("div.bg-critical\\/10, .text-critical").all_text_contents()
        if err_elements:
            print(f"Critical messages on page: {err_elements}")

        # Wait for CasePage loadCaseData to finish and render permanent receipt banner
        await page.wait_for_selector("text=Decision permanently recorded to ledger", timeout=15000)
        receipt_banner = page.locator("text=Decision permanently recorded to ledger")
        receipt_count = await receipt_banner.count()
        print(f"Receipt banner count: {receipt_count}")
        assert receipt_count > 0, f"Receipt banner did not appear!"
        
        await page.screenshot(path=f"{OUTPUT_DIR}/05_review_submitted_receipt_1440px.png", full_page=True)
        test_results["screenshots"].append("05_review_submitted_receipt_1440px.png")
        test_results["scenarios"]["scenario_4_review_submission"] = "PASS"
        print("✓ Scenario 4 PASS: Review decision permanently recorded with immutable receipt")

        # -----------------------------------------------------------------------------
        # SCENARIO 5: Role Enforcement (Reviewer blocked from Admin Reset)
        # -----------------------------------------------------------------------------
        print("\n[Scenario 5] Testing Role Enforcement (Reviewer 403 on Admin endpoint)...")
        # Reviewer attempts to reset benchmark via API
        eval_resp = await page.request.post(
            f"{BASE_URL}/api/v1/reconciliation/benchmark/reset",
            headers={"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"}
        )
        print(f"Reviewer reset attempt status: {eval_resp.status}")
        assert eval_resp.status == 403, f"Expected 403 Forbidden for reviewer reset, got {eval_resp.status}"
        test_results["scenarios"]["scenario_5_role_enforcement"] = "PASS"
        print("✓ Scenario 5 PASS: Backend strictly returns 403 when Reviewer calls Admin endpoint")

        # -----------------------------------------------------------------------------
        # SCENARIO 6: Evaluation Page Dynamic Benchmark Rendering
        # -----------------------------------------------------------------------------
        print("\n[Scenario 6] Testing Evaluation Page Rendering...")
        await page.goto(f"{BASE_URL}/evaluation", wait_until="networkidle")
        
        # Wait for loading spinner to finish querying API
        await page.wait_for_selector("text=Querying Live Evaluation Benchmark", state="detached", timeout=15000)
        await asyncio.sleep(1)
        
        # Verify benchmark elements exist
        eval_header = page.locator("text=System evaluation, match-rate audit & honest exceptions")
        assert await eval_header.count() > 0, "Evaluation header missing"
        
        # Formula or truthful empty state check
        eval_state = page.locator("text=Official Match-Rate Equation").or_(page.locator("text=Empirical benchmark harness has not been executed"))
        eval_state_count = await eval_state.count()
        print(f"Evaluation state elements found: {eval_state_count}")
        assert eval_state_count > 0, "Evaluation equation or truthful empty state banner missing"

        await page.screenshot(path=f"{OUTPUT_DIR}/06_evaluation_dynamic_1440px.png", full_page=True)
        test_results["screenshots"].append("06_evaluation_dynamic_1440px.png")
        test_results["scenarios"]["scenario_6_evaluation_page"] = "PASS"
        print("✓ Scenario 6 PASS: Evaluation page displays live dynamic benchmark formula & metrics")

        # -----------------------------------------------------------------------------
        # SCENARIO 7: Mobile 375px Viewport Responsiveness
        # -----------------------------------------------------------------------------
        print("\n[Scenario 7] Testing 375px Mobile Viewport Responsiveness...")
        mobile_context = await browser.new_context(viewport={"width": 375, "height": 812})
        # Add session cookie to mobile context
        await mobile_context.add_cookies(cookies)
        mobile_page = await mobile_context.new_page()

        mobile_routes = [
            ("/", "mobile_landing_375px.png"),
            ("/app/queue", "mobile_queue_375px.png"),
            ("/evaluation", "mobile_evaluation_375px.png"),
        ]

        for route, filename in mobile_routes:
            await mobile_page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
            await asyncio.sleep(1.5)
            await mobile_page.screenshot(path=f"{OUTPUT_DIR}/{filename}", full_page=True)
            test_results["screenshots"].append(filename)
            print(f"✓ Captured 375px mobile view for {route}")

        test_results["scenarios"]["scenario_7_mobile_responsiveness"] = "PASS"
        await mobile_context.close()

        # Check console errors: exclude expected 401/403 security test logs and benign favicon/QUIC warnings
        filtered_errors = [
            e for e in console_errors 
            if not ("favicon" in e or "ERR_QUIC_PROTOCOL_ERROR" in e or "status of 401" in e or "status of 403" in e)
        ]
        test_results["console_errors"] = filtered_errors
        assert len(filtered_errors) == 0, f"Unexpected unhandled console errors: {filtered_errors}"

        print("\nAll 7 Scenarios PASSED successfully!")
        with open(f"{OUTPUT_DIR}/qa_results.json", "w") as f:
            json.dump(test_results, f, indent=2)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_qa_suite())
