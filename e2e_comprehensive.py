import asyncio
import json
import traceback
from playwright.async_api import async_playwright

async def run():
    report = {
        "routes": [],
        "computed_fonts": {},
        "queue_interactions": {},
        "case_workflow": {},
        "accessibility": {},
        "errors": []
    }
    
    async def run_axe(page, label):
        try:
            await page.add_script_tag(path="axe.min.js")
            results = await page.evaluate("axe.run()")
            report["accessibility"][label] = {
                "violations": len(results["violations"]),
                "passes": len(results["passes"]),
                "incomplete": len(results["incomplete"]),
                "details": [{"id": v["id"], "impact": v["impact"]} for v in results["violations"]]
            }
        except Exception as e:
            report["errors"].append(f"axe failed on {label}: {e}")

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={'width': 1440, 'height': 900})
            page = await context.new_page()
            
            # --- 1. A11y & Route Verification ---
            routes = ["/", "/how-it-works", "/evidence", "/evaluation", "/docs", "/about", 
                      "/app", "/app/dashboard", "/app/queue", "/app/ingestion", 
                      "/app/audit", "/app/policies", "/app/settings"]
            
            for route in routes:
                url = f"http://localhost:5173{route}"
                await page.goto(url)
                await page.wait_for_load_state("networkidle")
                
                h1 = await page.evaluate("document.querySelector('h1') ? document.querySelector('h1').innerText : 'NO H1'")
                content = await page.evaluate("document.body.innerText")
                is_blank = len(content.strip()) < 10
                
                report["routes"].append({
                    "route": route,
                    "heading": h1.strip(),
                    "blank": is_blank
                })
                
                if route in ["/", "/app/queue", "/app/audit", "/app/settings"]:
                    await run_axe(page, f"Desktop: {route}")
                
            mobile_context = await browser.new_context(viewport={'width': 375, 'height': 812})
            mpage = await mobile_context.new_page()
            for route in ["/", "/app/queue", "/app/audit", "/app/settings"]:
                url = f"http://localhost:5173{route}"
                await mpage.goto(url)
                await mpage.wait_for_load_state("networkidle")
                await run_axe(mpage, f"Mobile: {route}")
            await mobile_context.close()
                
            # --- 2. Compute Fonts Check (on Queue page) ---
            await page.goto("http://localhost:5173/app/queue")
            await page.wait_for_load_state("networkidle")
            
            font_eval = await page.evaluate('''() => {
                const getFont = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? window.getComputedStyle(el).fontFamily : "Not Found";
                };
                return {
                    heading: getFont("h1"),
                    body: getFont("body"),
                    money: getFont(".font-mono")
                };
            }''')
            report["computed_fonts"] = font_eval
            
            # --- 3. Queue Interactions ---
            await page.locator("text=Critical").first.click(timeout=3000)
            await page.wait_for_timeout(1000)
            crit_rows_text = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('table tbody tr')).map(row => row.innerText);
            }''')
            report["queue_interactions"]["critical_rows_sample"] = crit_rows_text[:3]
            
            await page.locator("text=High").first.click(timeout=3000)
            await page.wait_for_timeout(1000)
            high_rows_text = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('table tbody tr')).map(row => row.innerText);
            }''')
            report["queue_interactions"]["high_rows_sample"] = high_rows_text[:3]
            
            await page.locator("text=Any Severity").first.click(timeout=3000)
            await page.wait_for_timeout(1000)
            
            
            # Real scrolling Test
            await page.evaluate("window.scrollTo(0,0)")
            
            nav_pos = await page.evaluate("window.getComputedStyle(document.querySelector('nav') || document.querySelector('.w-full.border-b')).position")
            
            sidebar = page.locator('.overflow-y-auto').first
            
            scroll_before = await page.evaluate('''() => {
                const sidebar = document.querySelector('.overflow-y-auto');
                return {
                    sidebar: sidebar ? sidebar.scrollTop : null,
                    window: window.scrollY
                };
            }''')
            
            # Simulate real mouse wheel over sidebar
            sidebar_box = await sidebar.bounding_box()
            if sidebar_box:
                await page.mouse.move(sidebar_box["x"] + 10, sidebar_box["y"] + 10)
                await page.mouse.wheel(0, 500)
                await page.wait_for_timeout(1000)
                
            scroll_after = await page.evaluate('''() => {
                const sidebar = document.querySelector('.overflow-y-auto');
                return {
                    sidebar: sidebar ? sidebar.scrollTop : null,
                    window: window.scrollY
                };
            }''')
            report["queue_interactions"]["real_scroll_test"] = {
                "before": scroll_before,
                "after": scroll_after,
                "nav_position": nav_pos
            }


            # --- 4. Workflow ---
            # Click the first row
            first_case = page.locator("table tbody tr").first
            await first_case.click(timeout=3000)
            await page.wait_for_load_state("networkidle")
            
            case_url = page.url
            report["case_workflow"]["url"] = case_url
            
            # A11y on Case page
            await run_axe(page, "Desktop: /app/case/:id")
            
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
            
            await page_b.fill('input[placeholder*="e.g. j.doe"]', "parallel_user")
            await page_b.click('label:has-text("Approve Match")')
            await page_b.fill('textarea[placeholder*="rationale"]', "Submitting first context")
            await page_b.click('button:has-text("Submit Human Decision")')
            await page_b.wait_for_timeout(1000)
            
            await page.fill('input[placeholder*="e.g. j.doe"]', "primary_user")
            await page.click('label:has-text("Reject")')
            await page.fill('textarea[placeholder*="rationale"]', "Submitting stale context")
            await page.click('button:has-text("Submit Human Decision")')
            await page.wait_for_timeout(1000)
            
            has_conflict_alert = await page.locator("text=Concurrent Modification Detected").count() > 0
            report["case_workflow"]["optimistic_locking_409"] = has_conflict_alert
            
            await browser.close()
            
    except Exception as e:
        report["errors"].append(traceback.format_exc())
        
    with open("e2e_final.json", "w") as f:
        json.dump(report, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run())
