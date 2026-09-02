import asyncio
from playwright.async_api import async_playwright
import os

async def run_e2e():
    print("Starting Playwright E2E test...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        print("Navigating to Ingestion Page...")
        await page.goto("http://localhost:5173/app/ingestion")
        await page.wait_for_load_state("networkidle")

        # Select Feed Type and Upload
        files_to_upload = [
            ("payments", "data/synthetic/payments.csv"),
            ("settlements", "data/synthetic/settlements.csv"),
            ("bank-credits", "data/synthetic/bank_credits.csv"),
            ("refunds", "data/synthetic/refunds.csv")
        ]

        for feed_type, file_path in files_to_upload:
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                continue
            
            print(f"Uploading {feed_type}...")
            # We don't have Playwright easily interacting with CustomSelect if it's too complex, 
            # let's just use the file input directly. 
            # The UI has: <input type="file" ... />
            
            # Since CustomSelect is used for feed type:
            await page.click('text=Select Feed Type')
            await page.click(f"text={feed_type.replace('-', ' ').title()}")
            
            await page.set_input_files('input[type="file"]', file_path)
            await page.click('button[type="submit"]')
            
            # Wait for success message
            await page.wait_for_selector('text=Batch Ingested Successfully', timeout=10000)
            print(f"Successfully uploaded {feed_type}.")
            
            # Click another place to reset or refresh page to upload next
            await page.reload()
            await page.wait_for_load_state("networkidle")

        # Run Recon Engine
        print("Running Recon Engine...")
        await page.click('button[title="Run Recon Engine (Cmd+E)"]')
        await page.wait_for_timeout(2000) # wait for recon to finish

        print("Checking Dashboard...")
        await page.goto("http://localhost:5173/app/dashboard")
        await page.wait_for_load_state("networkidle")
        # Wait for stats to load
        await page.wait_for_selector('text=Exposure at Risk', timeout=5000)

        print("Checking Queue...")
        await page.goto("http://localhost:5173/app/queue")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_selector('table', timeout=5000)
        
        print("Checking Audit Log...")
        await page.goto("http://localhost:5173/app/audit")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_selector('text=The Story of the Ledger', timeout=5000)
        
        print("E2E Test completed successfully!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_e2e())
