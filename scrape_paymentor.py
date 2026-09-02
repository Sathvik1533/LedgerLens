import asyncio
from playwright.async_api import async_playwright

async def scrape():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://paymentor-ai.vercel.app/", wait_until="networkidle")
        
        # Get text content
        text = await page.evaluate("document.body.innerText")
        print("--- EXTRACTED TEXT ---")
        print(text)
        print("----------------------")
        
        # Get class names to understand the styling/aesthetic
        classes = await page.evaluate("""
            Array.from(document.querySelectorAll('*'))
                 .map(el => el.className)
                 .filter(c => typeof c === 'string' && c.trim() !== '')
                 .join(' ')
        """)
        
        # Simple unique class extraction
        unique_classes = set(classes.split())
        print("--- EXTRACTED TAILWIND CLASSES (Subset) ---")
        print(list(unique_classes)[:100])  # Just print 100 classes
        print("----------------------")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape())
