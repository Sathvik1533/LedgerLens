import asyncio
from playwright.async_api import async_playwright
import json

async def run():
    report = {
        "routes": [],
        "queue_interactions": {},
        "case_workflow": {},
        "errors": []
    }
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()
        
        # Capture console and errors
        page.on("console", lambda msg: report["errors"].append(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ['error', 'warning'] else None)
        page.on("pageerror", lambda err: report["errors"].append(f"PAGE ERROR: {err.message}"))
        page.on("requestfailed", lambda req: report["errors"].append(f"REQ FAILED: {req.url}"))
        
        # 1. Route Navigation & Refresh
        routes = [
            "/", "/how-it-works", "/evidence", "/evaluation", "/docs", "/about",
            "/app", "/app/dashboard", "/app/queue", "/app/ingestion", "/app/audit", 
            "/app/policies", "/app/settings"
        ]
        
        print("Starting routes...")
        for route in routes:
            url = f"http://localhost:5173{route}"
            res = await page.goto(url)
            await page.wait_for_load_state("networkidle")
            status = res.status if res else 0
            
            res_refresh = await page.reload()
            await page.wait_for_load_state("networkidle")
            
            # Use javascript to get heading
            h1 = await page.evaluate("document.querySelector('h1') ? document.querySelector('h1').innerText : 'NO H1'")
            content = await page.evaluate("document.body.innerText")
            is_blank = len(content.strip()) < 10
            
            report["routes"].append({
                "route": route,
                "status": status,
                "refresh_status": res_refresh.status if res_refresh else 0,
                "blank": is_blank,
                "heading": h1.strip()
            })
            
        # 2. Queue Interactions
        print("Queue interactions...")
        await page.goto("http://localhost:5173/app/queue")
        await page.wait_for_load_state("networkidle")
        
        try:
            await page.locator("text=Critical").first.click(timeout=2000)
            await page.wait_for_timeout(500)
            crit_rows = await page.locator("table tbody tr").count()
            report["queue_interactions"]["critical_rows"] = crit_rows
            
            await page.locator("text=High").first.click(timeout=2000)
            await page.wait_for_timeout(500)
            high_rows = await page.locator("table tbody tr").count()
            report["queue_interactions"]["high_rows"] = high_rows
        except Exception as e:
            report["errors"].append(f"Queue filter click failed: {e}")
        
        # Test Scroll Isolation
        scroll_eval = await page.evaluate('''() => {
            const sidebar = document.querySelector('.overflow-y-auto');
            if (sidebar) sidebar.scrollTop = 100;
            return {
                sidebarTop: sidebar ? sidebar.scrollTop : null,
                windowTop: window.scrollY
            };
        }''')
        report["queue_interactions"]["scroll_isolation"] = scroll_eval
        
        # 3. Full Case Workflow
        print("Case workflow...")
        try:
            first_case = page.locator("table tbody tr").first
            await first_case.click(timeout=2000)
            await page.wait_for_load_state("networkidle")
            
            case_url = page.url
            report["case_workflow"]["url"] = case_url
            
            has_gateway = await page.locator("text=Gateway").count() > 0
            has_settlement = await page.locator("text=Settlement").count() > 0
            has_bank = await page.locator("text=Bank").count() > 0
            report["case_workflow"]["evidence_blocks_visible"] = {
                "gateway": has_gateway, "settlement": has_settlement, "bank": has_bank
            }
            
            has_policy = await page.locator("text=Policy Grounding").count() > 0
            report["case_workflow"]["policy_advisory_visible"] = has_policy
            
            context_b = await browser.new_context()
            page_b = await context_b.new_page()
            await page_b.goto(case_url)
            await page_b.wait_for_load_state("networkidle")
            
            await page_b.fill('input[placeholder*="e.g. j.doe"]', "parallel_user", timeout=2000)
            await page_b.click('label:has-text("Approve Match")', timeout=2000)
            await page_b.fill('textarea[placeholder*="rationale"]', "Submitting first context", timeout=2000)
            await page_b.click('button:has-text("Submit Human Decision")', timeout=2000)
            await page_b.wait_for_timeout(1000)
            
            await page.fill('input[placeholder*="e.g. j.doe"]', "primary_user", timeout=2000)
            await page.click('label:has-text("Reject")', timeout=2000)
            await page.fill('textarea[placeholder*="rationale"]', "Submitting stale context", timeout=2000)
            await page.click('button:has-text("Submit Human Decision")', timeout=2000)
            await page.wait_for_timeout(1000)
            
            has_conflict_alert = await page.locator("text=Concurrent Modification Detected").count() > 0
            report["case_workflow"]["optimistic_locking_409"] = has_conflict_alert
        except Exception as e:
            report["errors"].append(f"Case workflow failed: {e}")
            
        await browser.close()
        
    with open("audit_full_results.json", "w") as f:
        json.dump(report, f, indent=2)
    print("Done")

if __name__ == "__main__":
    asyncio.run(run())
