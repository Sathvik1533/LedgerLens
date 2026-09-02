import re

path = 'frontend/src/pages/DashboardPage.tsx'
with open(path, 'r') as f:
    c = f.read()

# Fix sky/indigo dark mode classes to matching LedgerLens classes
c = c.replace('text-sky-400', 'text-source-blue')
c = c.replace('bg-sky-950/60', 'bg-source-blue/10')
c = c.replace('border-sky-500/20', 'border-source-blue/20')

c = c.replace('text-indigo-400', 'text-ink-900')
c = c.replace('bg-indigo-950/60', 'bg-ink-900/10')
c = c.replace('border-indigo-500/20', 'border-ink-900/20')

c = c.replace('bg-emerald-400', 'bg-matched-green')
c = c.replace('bg-emerald-500/80', 'bg-matched-green')

c = c.replace('hover:text-blue-300', 'hover:text-source-blue/80')
c = c.replace('group-hover:text-blue-300', 'group-hover:text-source-blue')

c = c.replace('bg-ledger-vermilion/10 text-ink-900', 'bg-ledger-vermilion/10 text-ledger-vermilion')

with open(path, 'w') as f:
    f.write(c)
