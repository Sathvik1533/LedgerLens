import os
import re

def fix_tokens(path):
    with open(path, 'r') as f:
        content = f.read()
    orig = content
    
    content = content.replace('text-zinc-950', 'text-ink-900')
    content = content.replace('hover:bg-zinc-850', 'hover:bg-paper-1')
    content = content.replace('bg-rose-950/40', 'bg-ledger-vermilion/10')
    content = content.replace('bg-rose-950/30', 'bg-ledger-vermilion/10')
    content = content.replace('bg-rose-950/60', 'bg-ledger-vermilion/10')
    content = content.replace('bg-rose-950/70', 'bg-ledger-vermilion/10')
    content = content.replace('text-rose-200', 'text-ink-900')
    content = content.replace('text-rose-300', 'text-ink-900')
    content = content.replace('text-emerald-200', 'text-matched-green')
    
    if orig != content:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Fixed {path}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_tokens(os.path.join(root, file))
