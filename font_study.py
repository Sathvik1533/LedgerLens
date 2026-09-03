import asyncio
from playwright.async_api import async_playwright
import os
import time

fonts = [
    {"name": "DM Sans", "url": "family=DM+Sans:wght@400;500;600;700"},
    {"name": "Plus Jakarta Sans", "url": "family=Plus+Jakarta+Sans:wght@400;500;600;700"},
    {"name": "IBM Plex Sans", "url": "family=IBM+Plex+Sans:wght@400;500;600;700"},
    {"name": "Source Sans 3", "url": "family=Source+Sans+3:wght@400;500;600;700"},
    {"name": "Public Sans", "url": "family=Public+Sans:wght@400;500;600;700"}
]

async def run():
    out_dir = "/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts"
    os.makedirs(out_dir, exist_ok=True)
    
    with open("frontend/index.html", "r") as f:
        orig_html = f.read()
    with open("frontend/tailwind.config.js", "r") as f:
        orig_tw = f.read()
        
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        desktop = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await desktop.new_page()
        
        for idx, font in enumerate(fonts):
            print(f"Testing {font['name']}...")
            
            # Inject into HTML
            new_html = orig_html
            # Remove old fonts
            import re
            new_html = re.sub(r'<link href="https://fonts.googleapis.com/css2[^"]+" rel="stylesheet">', '', new_html)
            new_html = new_html.replace('</head>', f'<link href="https://fonts.googleapis.com/css2?{font["url"]}&display=swap" rel="stylesheet">\n</head>')
            with open("frontend/index.html", "w") as f:
                f.write(new_html)
                
            # Inject into Tailwind
            new_tw = orig_tw
            new_tw = re.sub(r"sans: \['[^']+',", f"sans: ['\"{font['name']}\"',", new_tw)
            new_tw = re.sub(r"mono: \['[^']+',", f"mono: ['\"{font['name']}\"',", new_tw)
            new_tw = re.sub(r"display: \['[^']+',", f"display: ['\"{font['name']}\"',", new_tw)
            
            with open("frontend/tailwind.config.js", "w") as f:
                f.write(new_tw)
                
            # Wait for Vite hot reload
            await asyncio.sleep(4)
            
            # Queue Page
            await page.goto("http://127.0.0.1:5173/app/queue", wait_until="networkidle")
            await page.evaluate("document.body.style.fontVariantNumeric = 'tabular-nums';")
            await asyncio.sleep(2)
            await page.screenshot(path=f"{out_dir}/f{idx+1}_queue.png")
            
            # Case Page
            await page.goto("http://127.0.0.1:5173/app/case/264548b2-c896-42b7-a2a4-c0f3f0f614b9", wait_until="networkidle")
            await asyncio.sleep(2)
            await page.screenshot(path=f"{out_dir}/f{idx+1}_case.png")
            
            # Eval Page
            await page.goto("http://127.0.0.1:5173/evaluation", wait_until="networkidle")
            await asyncio.sleep(2)
            await page.screenshot(path=f"{out_dir}/f{idx+1}_eval.png")
            
        await browser.close()
        
    # Restore originals
    with open("frontend/index.html", "w") as f:
        f.write(orig_html)
    with open("frontend/tailwind.config.js", "w") as f:
        f.write(orig_tw)
        
    print("Done taking font screenshots.")

asyncio.run(run())
