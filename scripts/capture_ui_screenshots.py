import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ARTIFACTS_DIR = Path("/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc")

async def capture_all():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=2, # High-DPI retina screenshots
        )
        page = await context.new_page()

        # 1. Capture Queue Page
        print("1. Navigating to http://localhost:5173/ ...")
        await page.goto("http://localhost:5173/", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        
        queue_path = ARTIFACTS_DIR / "screenshot_01_queue.png"
        await page.screenshot(path=str(queue_path), full_page=False)
        print(f"✓ Saved: {queue_path}")

        # 2. Click first case to inspect (e.g. first row)
        print("2. Inspecting first case in queue...")
        inspect_btn = page.locator("table tbody tr button").first
        await inspect_btn.click()
        await page.wait_for_timeout(2000)

        case_workspace_path = ARTIFACTS_DIR / "screenshot_02_case_workspace.png"
        await page.screenshot(path=str(case_workspace_path), full_page=False)
        print(f"✓ Saved: {case_workspace_path}")

        # 3. Policy AI Drawer Expanded View
        print("3. Capturing RAG Copilot Policy Drawer...")
        # Scroll middle column down
        await page.evaluate("window.scrollBy(0, 350)")
        await page.wait_for_timeout(2000)

        rag_path = ARTIFACTS_DIR / "screenshot_03_rag_copilot.png"
        await page.screenshot(path=str(rag_path), full_page=False)
        print(f"✓ Saved: {rag_path}")

        # 4. Fill in Human Decision
        print("4. Filling Decision Form...")
        await page.evaluate("window.scrollTo(0, 0)")
        comment_input = page.locator("#review-comment")
        if await comment_input.count() > 0:
            await comment_input.fill("Discrepancy verified against merchant bank statement feed. Variance approved per SOP-402.")
            await page.wait_for_timeout(500)
            
            decision_path = ARTIFACTS_DIR / "screenshot_04_decision_panel.png"
            await page.screenshot(path=str(decision_path), full_page=False)
            print(f"✓ Saved: {decision_path}")

        # 5. Trigger Concurrent 409 Collision Demo
        print("5. Triggering Optimistic Locking 409 Banner...")
        # Submit the form to advance version from v1 -> v2 in backend
        submit_btn = page.locator("button:has-text('Submit Human Decision')")
        if await submit_btn.count() > 0:
            await submit_btn.click()
            await page.wait_for_timeout(1500)
            
            # Now try submitting again with stale version if possible or capture updated state
            decision_updated_path = ARTIFACTS_DIR / "screenshot_05_decision_submitted.png"
            await page.screenshot(path=str(decision_updated_path), full_page=False)
            print(f"✓ Saved: {decision_updated_path}")

        await browser.close()
        print("✓ All screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(capture_all())
