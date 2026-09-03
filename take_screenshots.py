import asyncio
from playwright.async_api import async_playwright
import os
import shutil

async def run():
    # Make sure output dir exists
    out_dir = "/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch"
    os.makedirs(out_dir, exist_ok=True)
    
    async with async_playwright() as p:
        # Launch Chromium (headless)
        browser = await p.chromium.launch(headless=True)
        
        # 1. Desktop Context
        desktop = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await desktop.new_page()
        
        # public page at the top
        await page.goto("http://127.0.0.1:5173/")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{out_dir}/public_top.png")
        
        # public page while scrolling
        await page.evaluate("window.scrollBy(0, 500)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{out_dir}/public_scroll.png")
        
        # evaluation metric cards
        await page.goto("http://127.0.0.1:5173/evaluation")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{out_dir}/evaluation_cards.png")
        
        # queue with Critical and High states
        await page.goto("http://127.0.0.1:5173/app/queue")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{out_dir}/queue_states.png")
        
        # case evidence comparison
        await page.goto("http://127.0.0.1:5173/app/case/264548b2-c896-42b7-a2a4-c0f3f0f614b9")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{out_dir}/case_evidence.png")
        
        # policy advisory & decision panel
        await page.evaluate("window.scrollBy(0, 300)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{out_dir}/policy_decision.png")
        
        # audit timeline
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{out_dir}/audit_timeline.png")
        
        await desktop.close()
        
        # 2. Mobile Context
        mobile = await browser.new_context(viewport={'width': 375, 'height': 667}, is_mobile=True, has_touch=True)
        mpage = await mobile.new_page()
        
        # mobile navigation (app)
        await mpage.goto("http://127.0.0.1:5173/app")
        await mpage.wait_for_timeout(2000)
        await mpage.screenshot(path=f"{out_dir}/mobile_nav.png")
        
        # mobile case workspace
        await mpage.goto("http://127.0.0.1:5173/app/case/264548b2-c896-42b7-a2a4-c0f3f0f614b9")
        await mpage.wait_for_timeout(2000)
        await mpage.screenshot(path=f"{out_dir}/mobile_case.png")
        
        await mobile.close()
        await browser.close()
        print("Screenshots taken.")

asyncio.run(run())
