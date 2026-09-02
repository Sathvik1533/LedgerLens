import asyncio
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

        print("Navigating to case detail...")
        await page.goto("http://localhost:5173/", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Click first case
        await page.locator("table tbody tr button").first.click()
        await page.wait_for_timeout(1500)

        # 1. Fill comment and capture Decision Panel
        comment_input = page.locator("#review-comment")
        await comment_input.fill("Bank statement feed UTR confirms gross credit of INR 7,350.83. Variance resolved per SOP-402.")
        await page.wait_for_timeout(500)
        
        decision_path = ARTIFACTS_DIR / "screenshot_04_decision_panel.png"
        await page.screenshot(path=str(decision_path), full_page=False)
        print(f"✓ Saved: {decision_path}")

        # 2. Click Submit
        submit_btn = page.locator("button[type='submit']")
        await submit_btn.click()
        await page.wait_for_timeout(1500)
        
        submitted_path = ARTIFACTS_DIR / "screenshot_05_decision_submitted.png"
        await page.screenshot(path=str(submitted_path), full_page=False)
        print(f"✓ Saved: {submitted_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
