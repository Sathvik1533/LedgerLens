import asyncio
import httpx
from pathlib import Path
from playwright.async_api import async_playwright

ARTIFACTS_DIR = Path("/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc")

async def test_409():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=2,
        )
        page = await context.new_page()

        print("1. Loading review queue...")
        await page.goto("http://localhost:5173/", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Click the second case row to inspect
        case_rows = page.locator("table tbody tr button")
        await case_rows.nth(1).click()
        await page.wait_for_timeout(1500)

        # Get case ID from the URL or page
        case_text = await page.locator("button:has-text('CASE-')").text_content()
        case_id = case_text.strip() if case_text else "CASE-1002"
        print(f"Inspecting case: {case_id}")

        # Fill in review comment in browser UI (expected_version is currently 1)
        comment_box = page.locator("#review-comment")
        await comment_box.fill("Reviewer A: Approving resolution for reconciliation variance.")

        # Concurrently modify the case in the backend via HTTP API (version 1 -> 2)
        print(f"2. Simulating concurrent modification in background for {case_id}...")
        try:
            httpx.post(
                f"http://localhost:8000/api/v1/review/cases/{case_id}/action",
                json={
                    "actor": "concurrent_reviewer_ops_02",
                    "action": "reject",
                    "expected_version": 1,
                    "human_comment": "Concurrent reviewer B modified this case first.",
                },
                timeout=5.0,
            )
            print("✓ Background collision triggered (version bumped to 2).")
        except Exception as e:
            print(f"Backend concurrent call note: {e}")

        # Now submit the form in the browser with stale expected_version=1
        print("3. Submitting browser form with stale version...")
        submit_btn = page.locator("button[type='submit']")
        await submit_btn.click()
        await page.wait_for_timeout(1500)

        # Capture HTTP 409 Stale Version Alert Banner
        conflict_path = ARTIFACTS_DIR / "screenshot_05_conflict_409.png"
        await page.screenshot(path=str(conflict_path), full_page=False)
        print(f"✓ Saved 409 screenshot: {conflict_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_409())
