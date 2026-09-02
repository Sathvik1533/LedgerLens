import asyncio
from playwright.async_api import async_playwright
import json

async def run():
    results = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # Test 1: Desktop Route Verification & Console/Network
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()
        
        errors = []
        page.on("pageerror", lambda err: errors.append(err.message))
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        
        routes = [
            "/", "/how-it-works", "/evidence", "/evaluation", "/docs", "/about",
            "/app", "/app/dashboard", "/app/queue", "/app/ingestion", "/app/audit", "/app/policies", "/app/settings"
        ]
        
        print("--- ROUTE VERIFICATION (Desktop) ---")
        for route in routes:
            url = f"http://localhost:5173{route}"
            errors.clear()
            res = await page.goto(url)
            await page.wait_for_load_state("networkidle")
            status = res.status if res else 0
            
            # Test direct refresh
            await page.reload()
            await page.wait_for_load_state("networkidle")
            
            # Check for generic "blank screen" by evaluating body innerText
            content = await page.evaluate("document.body.innerText")
            is_blank = len(content.strip()) < 10
            
            print(f"{route}: Status={status}, Blank={is_blank}, Errors={len(errors)}")
            results.append({
                "test": "Route_Navigation", "route": route, "status": status, "blank": is_blank, "errors": list(errors)
            })

        # Test 2: Queue Page Specifics
        print("--- QUEUE TESTS ---")
        await page.goto("http://localhost:5173/app/queue")
        await page.wait_for_load_state("networkidle")
        
        # Click Critical Filter
        await page.click('text="Critical"')
        await page.wait_for_timeout(500)
        
        # Verify filtering happened (check rows)
        rows_critical = await page.locator("table tbody tr").count()
        print(f"Queue rows after Critical filter: {rows_critical}")
        
        # Click High Filter
        await page.click('text="High"')
        await page.wait_for_timeout(500)
        rows_high = await page.locator("table tbody tr").count()
        print(f"Queue rows after High filter: {rows_high}")
        
        # Test Exception Category dropdown
        await page.click('text="All Categories"')
        await page.wait_for_timeout(300)
        await page.click('text="Missing Settlement"')
        await page.wait_for_timeout(500)
        rows_missing = await page.locator("table tbody tr").count()
        print(f"Queue rows after Missing Settlement filter: {rows_missing}")
        
        # Scroll test simulation via JS
        scroll_res = await page.evaluate('''() => {
            const sidebar = document.querySelector('.overflow-y-auto');
            if (!sidebar) return 'Sidebar scroll container not found';
            sidebar.scrollTop = 50;
            return {
                sidebarTop: sidebar.scrollTop,
                windowTop: window.scrollY
            };
        }''')
        print(f"Scroll test result: {scroll_res}")

        # Test 3: Mobile Route Verification
        print("--- ROUTE VERIFICATION (Mobile) ---")
        mobile_context = await browser.new_context(viewport={'width': 375, 'height': 812})
        mpage = await mobile_context.new_page()
        await mpage.goto("http://localhost:5173/app/dashboard")
        await mpage.wait_for_load_state("networkidle")
        mcontent = await mpage.evaluate("document.body.innerText")
        print(f"Mobile /app/dashboard loaded. Length: {len(mcontent)}")

        await browser.close()
        
    with open("e2e_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run())
