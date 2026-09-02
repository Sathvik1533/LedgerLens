import os
import re

def fix_file(path):
    with open(path, 'r') as f:
        content = f.read()
    orig = content
    
    content = content.replace('bg-gradient-to-r from-blue-900/60 to-indigo-900/60', 'bg-paper-1')
    content = content.replace('text-black', 'text-ink-900')
    content = content.replace('hover:bg-slate-200', 'hover:bg-paper-1')
    
    if orig != content:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Fixed {path}")

fix_file('frontend/src/components/Navbar.tsx')
fix_file('frontend/src/layouts/AppLayout.tsx')
fix_file('frontend/src/layouts/MarketingLayout.tsx')
fix_file('frontend/src/pages/marketing/LandingPage.tsx')
