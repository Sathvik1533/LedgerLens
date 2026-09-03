import asyncio
from playwright.async_api import async_playwright
import json

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating to coolors.co/palettes/trending...")
        
        # We need to bypass potential simple bot checks or just wait for the DOM
        await page.goto("https://coolors.co/palettes/trending", wait_until="domcontentloaded", timeout=60000)
        
        # Wait for the palettes to load
        try:
            await page.wait_for_selector('a.palette', timeout=15000)
        except Exception as e:
            print(f"Error waiting for .palette: {e}")
            content = await page.content()
            print("Page title:", await page.title())
            with open("coolors_debug.html", "w") as f:
                f.write(content)
                
        palettes = await page.evaluate('''() => {
            const items = document.querySelectorAll('a.palette');
            const results = [];
            for(let i=0; i<Math.min(10, items.length); i++) {
                results.push(items[i].href);
            }
            return results;
        }''')
        
        print("Found palettes:")
        for url in palettes:
            print(url)
            
        await browser.close()

asyncio.run(run())
