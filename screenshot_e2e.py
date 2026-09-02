import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        print("Capturing Dashboard...")
        await page.goto("http://localhost:5173/app/dashboard")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/dashboard_dynamic.png")

        print("Capturing Audit Log...")
        await page.goto("http://localhost:5173/app/audit")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/audit_dynamic.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
