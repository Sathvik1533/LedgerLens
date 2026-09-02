import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        print("Testing Case Navigation...")
        await page.goto("http://localhost:5173/app/queue")
        await page.wait_for_load_state("networkidle")
        
        # Click on the first case in the queue
        await page.click("table tbody tr:first-child")
        await page.wait_for_load_state("networkidle")
        
        url = page.url
        print(f"Navigated to Case: {url}")
        
        print("Testing Action Form Validation...")
        # Try to submit without decision
        await page.click('button:has-text("Submit Final Decision")')
        
        # Check if error or still disabled. In the UI, the submit button is disabled if `!decision` or `!reviewerName`
        # Let's check if button is disabled.
        is_disabled = await page.is_disabled('button:has-text("Submit Final Decision")')
        print(f"Submit button disabled initially? {is_disabled}")

        print("Testing Optimistic Locking (409)...")
        # We need to simulate a stale submission. We can do this by opening another context, submitting, then trying to submit in the first context.
        context_b = await browser.new_context()
        page_b = await context_b.new_page()
        await page_b.goto(url)
        await page_b.wait_for_load_state("networkidle")
        
        # Fill in context_b
        await page_b.fill('input[placeholder="e.g. j.doe"]', "concurrent_user")
        await page_b.click('label:has-text("Approve Match")')
        await page_b.fill('textarea[placeholder*="rationale"]', "Approving from Context B")
        await page_b.click('button:has-text("Submit Final Decision")')
        await page_b.wait_for_selector('text=successfully')
        print("Context B submitted successfully.")

        # Fill in context_a
        await page.fill('input[placeholder="e.g. j.doe"]', "primary_user")
        await page.click('label:has-text("Reject / Disputed")')
        await page.fill('textarea[placeholder*="rationale"]', "Rejecting from Context A")
        await page.click('button:has-text("Submit Final Decision")')
        
        try:
            await page.wait_for_selector('text=Concurrent Modification Detected', timeout=3000)
            print("Context A hit 409 Optimistic Lock successfully.")
        except Exception as e:
            print(f"Did not see 409 error: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
