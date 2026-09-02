import os
import re

def clean_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    
    # 1. Colors
    content = re.sub(r'text-\[\#[0-9a-fA-F]{6}\]', 'text-ink-900', content) # EAF6FF -> text-ink-900
    content = re.sub(r'bg-zinc-[1-9]00(?:/[0-9]+)?', 'bg-paper-1', content)
    content = re.sub(r'text-zinc-[1-9]00(?:/[0-9]+)?', 'text-ink-700', content)
    content = re.sub(r'bg-white(?:/[0-9]+)?', 'bg-paper-0', content)
    content = re.sub(r'text-white(?:/[0-9]+)?', 'text-ink-900', content)
    content = re.sub(r'border-white/\[?0\.0\d\]?', 'border-rule-300', content)
    content = re.sub(r'bg-blue-600', 'bg-ink-900', content)
    content = re.sub(r'hover:bg-blue-500', 'hover:bg-ink-700', content)
    content = re.sub(r'bg-blue-[4-5]00', 'bg-source-blue', content)
    content = re.sub(r'text-emerald-200', 'text-matched-green', content)
    content = re.sub(r'bg-rose-500', 'bg-ledger-vermilion', content)
    content = re.sub(r'bg-amber-500', 'bg-advisory-amber', content)

    # 2. Remove shadows
    content = re.sub(r'shadow-(?:2xl|xl|lg|md|glow-cyan|glow-blue|\[[^\]]+\])', 'shadow-none', content)
    
    # 3. Gradients
    content = re.sub(r'bg-gradient-to-[a-z]+\s+from-[a-z]+-[0-9]+\s+(?:via-[a-z]+-[0-9]+\s+)?to-[a-z]+-[0-9]+', 'bg-paper-1 text-ink-900', content)
    content = re.sub(r'text-transparent bg-clip-text bg-gradient-to-[a-z]+\s+from-[a-z]+-[0-9]+\s+(?:via-[a-z]+-[0-9]+\s+)?to-[a-z]+-[0-9]+', 'text-ink-900 font-display italic', content)
    
    # 4. Remove Inter
    content = re.sub(r'font-sans', 'font-sans', content) # ensure font-sans maps to DM Sans now
    
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            clean_file(os.path.join(root, file))
