import asyncio
from playwright.async_api import async_playwright
import os

SCREENSHOT_DIR = "/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

routes = [
    ("landing", "/"),
    ("queue", "/app/queue"),
    ("case", "/app/case/cf8a177b-face-436d-8f26-277fa7282022"),
    ("settings", "/app/settings")
]

viewports = [
    (1440, "desktop"),
    (768, "tablet"),
    (375, "mobile")
]

async def capture_all():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for width, device in viewports:
            context = await browser.new_context(
                viewport={"width": width, "height": 900},
                device_scale_factor=2,
            )
            page = await context.new_page()
            
            for name, path in routes:
                print(f"Capturing {name} at {device}...")
                await page.goto(f"http://localhost:5173{path}", wait_until="networkidle")
                await page.wait_for_timeout(1000)
                await page.screenshot(path=f"{SCREENSHOT_DIR}/qa_{name}_{device}.png", full_page=True)
            
            await context.close()
        
        await browser.close()
        print("All responsive QA screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(capture_all())
