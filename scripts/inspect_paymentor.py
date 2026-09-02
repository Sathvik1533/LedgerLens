import asyncio
from playwright.async_api import async_playwright

async def inspect_paymentor():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = await context.new_page()
        try:
            print("Navigating to https://paymentor-ai.vercel.app/ ...")
            await page.goto("https://paymentor-ai.vercel.app/", wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)
            
            # Take full page screenshot
            await page.screenshot(path="/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/paymentor_reference_full.png", full_page=True)
            
            # Extract DOM structure, text, navigation items, page links
            title = await page.title()
            print(f"Title: {title}")
            
            nav_links = await page.eval_on_selector_all("nav a, aside a, a", "elements => elements.map(e => ({ text: e.innerText.trim(), href: e.getAttribute('href') })).filter(e => e.text)")
            print(f"Links/Nav: {nav_links[:20]}")
            
            # Check buttons and tabs
            buttons = await page.eval_on_selector_all("button, [role='tab']", "elements => elements.map(e => e.innerText.trim()).filter(Boolean)")
            print(f"Buttons/Tabs: {buttons[:20]}")
            
            # Click around different tabs/routes if any
            for link in nav_links[:10]:
                href = link.get('href')
                if href and href.startswith('/') and href != '/':
                    print(f"Navigating to subroute {href}...")
                    try:
                        sub_url = f"https://paymentor-ai.vercel.app{href}"
                        await page.goto(sub_url, wait_until="networkidle", timeout=15000)
                        await page.wait_for_timeout(1500)
                        safe_name = href.replace('/', '_')
                        await page.screenshot(path=f"/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/paymentor_{safe_name}.png", full_page=True)
                    except Exception as e:
                        print(f"Failed to navigate to {href}: {e}")

        except Exception as e:
            print(f"Error inspecting: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_paymentor())
