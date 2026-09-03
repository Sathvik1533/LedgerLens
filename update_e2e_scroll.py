with open("e2e_comprehensive.py", "r") as f:
    c = f.read()

# Make sure we log the position type of the nav
scroll_test_logic = '''
            # Real scrolling Test
            await page.evaluate("window.scrollTo(0,0)")
            
            nav_pos = await page.evaluate("window.getComputedStyle(document.querySelector('nav') || document.querySelector('.w-full.border-b')).position")
            
            sidebar = page.locator('.overflow-y-auto').first
            
            scroll_before = await page.evaluate(\'\'\'() => {
                const sidebar = document.querySelector('.overflow-y-auto');
                return {
                    sidebar: sidebar ? sidebar.scrollTop : null,
                    window: window.scrollY
                };
            }\'\'\')
            
            # Simulate real mouse wheel over sidebar
            sidebar_box = await sidebar.bounding_box()
            if sidebar_box:
                await page.mouse.move(sidebar_box["x"] + 10, sidebar_box["y"] + 10)
                await page.mouse.wheel(0, 500)
                await page.wait_for_timeout(1000)
                
            scroll_after = await page.evaluate(\'\'\'() => {
                const sidebar = document.querySelector('.overflow-y-auto');
                return {
                    sidebar: sidebar ? sidebar.scrollTop : null,
                    window: window.scrollY
                };
            }\'\'\')
            report["queue_interactions"]["real_scroll_test"] = {
                "before": scroll_before,
                "after": scroll_after,
                "nav_position": nav_pos
            }
'''

import re
c = re.sub(r'# Real scrolling Test.*?report\["queue_interactions"\]\["real_scroll_test"\] = \{.*?"after": scroll_after\n\s+\}', scroll_test_logic, c, flags=re.DOTALL)

with open("e2e_comprehensive.py", "w") as f:
    f.write(c)
