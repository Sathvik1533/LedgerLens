import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.on("console", lambda msg: print("CONSOLE:", msg.text))
        page.on("pageerror", lambda err: print("PAGE ERROR:", err.message))
        await page.goto("http://localhost:5173/app/audit")
        await page.wait_for_timeout(2000)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
