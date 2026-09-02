import os
import re

path = 'frontend/src/components/ReviewActionForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fixes
content = content.replace('bg-rose-950/40', 'bg-ledger-vermilion/10')
content = content.replace('text-rose-200', 'text-ink-900')
content = content.replace('text-rose-300', 'text-ink-900')
content = content.replace('bg-rose-900', 'bg-ledger-vermilion')
content = content.replace('hover:bg-rose-800', 'hover:bg-ledger-vermilion/80')
content = content.replace('border-rose-600/40', 'border-ledger-vermilion')

content = content.replace('bg-paper-0/80', 'bg-paper-0')
content = content.replace('bg-paper-0/60', 'bg-paper-0')
content = content.replace('placeholder-zinc-500', 'placeholder-ink-700/50')
content = content.replace('placeholder-zinc-600', 'placeholder-ink-700/50')
content = content.replace('hover:bg-zinc-850', 'hover:bg-paper-1')

content = content.replace('bg-rose-950/30', 'bg-ledger-vermilion/10')
content = content.replace('text-emerald-600', 'text-matched-green')
content = content.replace('text-rose-600', 'text-ledger-vermilion')
content = content.replace('text-amber-600', 'text-advisory-amber')

content = content.replace('text-zinc-950', 'text-ink-900')

with open(path, 'w') as f:
    f.write(content)
