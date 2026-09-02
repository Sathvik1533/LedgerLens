import asyncio
import json
from playwright.async_api import async_playwright

async def run():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # 1. Desktop Tests
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()
        
        # Axe setup
        await page.goto("https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js")
        axe_script = await page.content()
        
        async def run_axe(page, route):
            try:
                await page.add_script_tag(url="https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js")
                # Wait for axe to be defined
                await page.wait_for_function("typeof axe !== 'undefined'", timeout=5000)
                res = await page.evaluate("axe.run()")
                return len(res.get('violations', []))
            except Exception as e:
                print(f"Axe failed on {route}: {e}")
                return -1

        print("--- Testing Routes ---")
        routes = [
            "/", "/how-it-works", "/evidence", "/evaluation", "/docs", "/about",
            "/app", "/app/dashboard", "/app/queue", "/app/ingestion", "/app/audit", "/app/policies", "/app/settings"
        ]
        route_results = {}
        for r in routes:
            errors = []
            page.on("pageerror", lambda err: errors.append(err.message))
            res = await page.goto(f"http://localhost:5173{r}")
            await page.wait_for_load_state("networkidle")
            
            # test reload
            await page.reload()
            await page.wait_for_load_state("networkidle")
            
            v = await run_axe(page, r)
            blank = await page.evaluate("document.body.innerText.length < 10")
            route_results[r] = {
                "status": res.status if res else 0,
                "blank": blank,
                "errors": len(errors),
                "axe_violations": v
            }
            print(f"Route {r} -> {route_results[r]}")
        results["routes"] = route_results

        # 2. Queue Interaction Tests
        print("--- Testing Queue ---")
        await page.goto("http://localhost:5173/app/queue")
        await page.wait_for_load_state("networkidle")
        
        initial_rows = await page.locator("table tbody tr").count()
        print(f"Initial Queue Rows: {initial_rows}")
        
        # Click Critical Filter
        # Wait, the radio label is the span containing the text. We can click it via JS or locator.
        await page.evaluate('''() => {
            const labels = Array.from(document.querySelectorAll('label'));
            const critical = labels.find(l => l.innerText.toLowerCase().includes('critical'));
            if(critical) critical.click();
        }''')
        await page.wait_for_timeout(1000)
        crit_rows = await page.locator("table tbody tr").count()
        print(f"Critical Rows: {crit_rows}")
        
        # Click High
        await page.evaluate('''() => {
            const labels = Array.from(document.querySelectorAll('label'));
            const high = labels.find(l => l.innerText.toLowerCase().includes('high'));
            if(high) high.click();
        }''')
        await page.wait_for_timeout(1000)
        high_rows = await page.locator("table tbody tr").count()
        print(f"High Rows: {high_rows}")
        
        results["queue"] = {
            "initial": initial_rows,
            "critical": crit_rows,
            "high": high_rows
        }
        
        # 3. Case Workflow
        print("--- Testing Case Workflow ---")
        await page.evaluate('''() => {
            const labels = Array.from(document.querySelectorAll('label'));
            const all = labels.find(l => l.innerText.toLowerCase().includes('all'));
            if(all) all.click();
        }''')
        await page.wait_for_timeout(1000)
        # click first case
        await page.click("table tbody tr:first-child")
        await page.wait_for_load_state("networkidle")
        case_url = page.url
        print(f"Case URL: {case_url}")
        
        # Check evidence sections
        evidence_text = await page.evaluate("document.body.innerText")
        has_gateway = "Gateway Proof" in evidence_text or "Payment Gateway" in evidence_text or "Amount" in evidence_text
        
        results["case"] = {
            "url": case_url,
            "evidence_visible": has_gateway
        }
        
        # 4. Mobile Context Test (375x812)
        print("--- Testing Mobile ---")
        m_ctx = await browser.new_context(viewport={'width': 375, 'height': 812})
        mpage = await m_ctx.new_page()
        await mpage.goto("http://localhost:5173/app/dashboard")
        await mpage.wait_for_load_state("networkidle")
        results["mobile_dashboard_loaded"] = True
        
        await browser.close()

    with open("e2e_final.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run())
