import asyncio
from playwright.async_api import async_playwright
import os

SCREENSHOT_DIR = "/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc"

async def capture_all():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = await context.new_page()

        # 1. Dashboard
        print("Capturing 1: Dashboard...")
        await page.goto("http://localhost:5173/dashboard", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{SCREENSHOT_DIR}/screen_01_dashboard.png", full_page=True)

        # 2. Exceptions Queue
        print("Capturing 2: Exceptions Queue...")
        await page.goto("http://localhost:5173/exceptions", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{SCREENSHOT_DIR}/screen_02_exceptions_queue.png", full_page=True)

        # 3. Case Workspace (3-column layout)
        print("Capturing 3: Case Workspace...")
        await page.goto("http://localhost:5173/exceptions/cf8a177b-face-436d-8f26-277fa7282022", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=f"{SCREENSHOT_DIR}/screen_03_case_workspace.png", full_page=True)

        # 4. Ingestion Feeds Hub
        print("Capturing 4: Ingestion Feeds...")
        await page.goto("http://localhost:5173/ingestion", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{SCREENSHOT_DIR}/screen_04_data_feeds.png", full_page=True)

        # 5. Audit Trail & Compliance Ledger
        print("Capturing 5: Audit Trail...")
        await page.goto("http://localhost:5173/audit", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{SCREENSHOT_DIR}/screen_05_audit_trail.png", full_page=True)

        # 6. Policy Knowledge Base & RAG Playground
        print("Capturing 6: Policy Knowledge Base...")
        await page.goto("http://localhost:5173/policies", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{SCREENSHOT_DIR}/screen_06_policy_rag.png", full_page=True)

        await browser.close()
        print("All screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(capture_all())
