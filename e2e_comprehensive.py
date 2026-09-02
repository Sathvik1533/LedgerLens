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
            routes = ["/", "/app/queue", "/app/case/264548b2-c896-42b7-a2a4-c0f3f0f614b9", "/app/audit", "/app/settings"]
            for route in routes:
                url = f"http://localhost:5173{route}"
                await page.goto(url)
                await page.wait_for_load_state("networkidle")
                await run_axe(page, f"Desktop: {route}")
                
            mobile_context = await browser.new_context(viewport={'width': 375, 'height': 812})
            mpage = await mobile_context.new_page()
            for route in routes:
                url = f"http://localhost:5173{route}"
                await mpage.goto(url)
                await mpage.wait_for_load_state("networkidle")
                await run_axe(mpage, f"Mobile: {route}")
            await mobile_context.close()
                
            # Compute Fonts Check (on Queue page)
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
                    mono: getFont(".font-mono")
                };
            }''')
            report["computed_fonts"] = font_eval
            
            # Queue Interactions (Row text verification)
            await page.locator("text=Critical").first.click(timeout=3000)
            await page.wait_for_timeout(1000)
            # Fetch text of first 3 rows
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
            
            # Real scrolling Test
            await page.evaluate("window.scrollTo(0,0)")
            
            sidebar = page.locator('.overflow-y-auto').first
            await sidebar.focus()
            
            scroll_before = await page.evaluate('''() => {
                return {
                    sidebar: document.querySelector('.overflow-y-auto').scrollTop,
                    window: window.scrollY
                };
            }''')
            
            # Simulate real mouse wheel over sidebar
            sidebar_box = await sidebar.bounding_box()
            await page.mouse.move(sidebar_box["x"] + 10, sidebar_box["y"] + 10)
            await page.mouse.wheel(0, 500)
            await page.wait_for_timeout(1000)
            
            scroll_after = await page.evaluate('''() => {
                return {
                    sidebar: document.querySelector('.overflow-y-auto').scrollTop,
                    window: window.scrollY
                };
            }''')
            report["queue_interactions"]["real_scroll_test"] = {
                "before": scroll_before,
                "after": scroll_after
            }

            # Workflow
            await page.goto("http://localhost:5173/app/case/264548b2-c896-42b7-a2a4-c0f3f0f614b9")
            await page.wait_for_load_state("networkidle")
            
            report["case_workflow"]["gateway_visible"] = await page.locator("text=Gateway").count() > 0
            
            await browser.close()
            
    except Exception as e:
        report["errors"].append(traceback.format_exc())
        
    with open("e2e_final.json", "w") as f:
        json.dump(report, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run())
