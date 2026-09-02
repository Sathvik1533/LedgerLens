import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 1000})
        
        await page.goto("http://localhost:5173/")
        await asyncio.sleep(4) # let animations play out a bit
        await page.screenshot(path="/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/qa_landing_dynamic.png", full_page=True)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
