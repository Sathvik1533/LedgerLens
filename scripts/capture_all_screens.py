import asyncio
import httpx
from pathlib import Path
from playwright.async_api import async_playwright

ARTIFACTS_DIR = Path("/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc")

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=2,
        )
        page = await context.new_page()

        # 1. Queue Page
        print("1. Capturing Queue Page...")
        await page.goto("http://localhost:5173/", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=str(ARTIFACTS_DIR / "screenshot_01_queue.png"))
        print("✓ Saved screenshot_01_queue.png")

        # 2. Case Workspace (first case)
        print("2. Inspecting first case...")
        await page.locator("button[aria-label^='Inspect case']").first.click()
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(ARTIFACTS_DIR / "screenshot_02_case_workspace.png"))
        print("✓ Saved screenshot_02_case_workspace.png")

        # 3. Policy AI Drawer Expanded
        print("3. Capturing Policy AI Drawer...")
        await page.locator("button[aria-label='Toggle policy explanation drawer']").click()
        await page.wait_for_timeout(1000)
        await page.evaluate("window.scrollBy(0, 240)")
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(ARTIFACTS_DIR / "screenshot_03_rag_copilot.png"))
        print("✓ Saved screenshot_03_rag_copilot.png")

        # 4. Fill in decision form
        print("4. Filling Decision Form...")
        await page.evaluate("window.scrollTo(0, 0)")
        await page.locator("#review-comment").fill("Merchant fee deviation investigated against bank statement UTR feed. 2% standard rate verified, manual adjustment approved per SOP-402.")
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(ARTIFACTS_DIR / "screenshot_04_decision_panel.png"))
        print("✓ Saved screenshot_04_decision_panel.png")

        # 5. Return to queue and pick a fresh case for 409 collision demo
        print("5. Triggering 409 collision on fresh case...")
        await page.locator("button[title='Return to review queue']").click()
        await page.wait_for_timeout(1000)
        
        # Click 3rd case
        await page.locator("button[aria-label^='Inspect case']").nth(2).click()
        await page.wait_for_timeout(1500)

        case_id_btn = page.locator("button[title='Click to copy case ID']")
        case_id = (await case_id_btn.text_content()).strip()
        print(f"Targeting collision case: {case_id}")

        await page.locator("#review-comment").fill("Reviewer A: Approving variance per SOP.")

        # Out of band backend call bumps version from 1 -> 2
        res = httpx.post(
            f"http://localhost:8000/api/v1/review/cases/{case_id}/review",
            json={
                "actor": "concurrent_analyst_02",
                "action": "reject",
                "expected_version": 1,
                "human_comment": "Concurrent reviewer modified this case simultaneously in production.",
            },
            timeout=5.0,
        )
        print(f"Background mutation status: {res.status_code}")

        # Submit form with stale version 1 from browser
        await page.locator("button[type='submit']").click()
        await page.wait_for_timeout(1200)

        # Capture HTTP 409 Alert
        await page.screenshot(path=str(ARTIFACTS_DIR / "screenshot_05_conflict_409.png"))
        print("✓ Saved screenshot_05_conflict_409.png")

        await browser.close()
        print("All 5 high-res screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(run())
