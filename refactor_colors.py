import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    # Backgrounds
    content = re.sub(r'bg-\[\#080D1A\](?:/\d+)?', 'bg-paper-0', content)
    content = re.sub(r'bg-\[\#020713\](?:/\d+)?', 'bg-paper-1', content)
    content = re.sub(r'bg-\[\#030B1B\](?:/\d+)?', 'bg-paper-1', content)
    content = re.sub(r'bg-\[\#0F172A\](?:/\d+)?', 'bg-paper-1', content)
    content = re.sub(r'bg-\[\#1E293B\](?:/\d+)?', 'bg-paper-1', content)
    content = re.sub(r'bg-\[\#08142C\](?:/\d+)?', 'bg-paper-1', content)
    content = re.sub(r'bg-zinc-900(?:/\d+)?', 'bg-paper-1', content)
    content = re.sub(r'bg-blue-950(?:/\d+)?', 'bg-source-blue/10', content)
    content = re.sub(r'bg-emerald-950(?:/\d+)?', 'bg-matched-green/10', content)
    content = re.sub(r'bg-amber-950(?:/\d+)?', 'bg-advisory-amber/10', content)
    
    # Text colors
    content = re.sub(r'text-white', 'text-ink-900', content)
    content = re.sub(r'text-\[\#FFFAF4\]', 'text-ink-900', content)
    content = re.sub(r'text-\[\#94A3B8\]', 'text-ink-700', content)
    content = re.sub(r'text-\[\#829BB8\]', 'text-ink-700', content)
    content = re.sub(r'text-zinc-400', 'text-ink-700', content)
    content = re.sub(r'text-zinc-600', 'text-ink-700', content)
    content = re.sub(r'text-blue-[45]00', 'text-source-blue', content)
    content = re.sub(r'text-rose-[45]00', 'text-ledger-vermilion', content)
    content = re.sub(r'text-emerald-[345]00', 'text-matched-green', content)
    content = re.sub(r'text-amber-[345]00', 'text-advisory-amber', content)

    # Borders
    content = re.sub(r'border-\[\#1E293B\]', 'border-rule-300', content)
    content = re.sub(r'border-white/\[?0\.0\d\]?', 'border-rule-300', content)
    content = re.sub(r'border-blue-500(?:/\d+)?', 'border-source-blue', content)
    content = re.sub(r'border-rose-500(?:/\d+)?', 'border-ledger-vermilion', content)
    content = re.sub(r'border-emerald-500(?:/\d+)?', 'border-matched-green', content)
    content = re.sub(r'border-amber-500(?:/\d+)?', 'border-advisory-amber', content)

    # Buttons and gradients
    content = re.sub(r'bg-blue-600 hover:bg-blue-500 active:bg-blue-700', 'bg-ink-900 hover:bg-ink-700 active:bg-ink-900 text-paper-0', content)
    content = re.sub(r'bg-gradient-to-br from-blue-500 to-cyan-400', 'bg-ledger-vermilion', content)
    
    # Specific component styles replacement
    # RagCopilotPanel - remove sparkles
    content = content.replace('<Sparkles className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />', '<BookOpen className="w-4 h-4 text-advisory-amber shrink-0" aria-hidden="true" />')
    
    # Replace layout background
    content = content.replace('bg-[#080D1A]', 'bg-paper-0')
    content = content.replace('bg-zinc-950', 'bg-paper-0')
    
    # font-bold uppercase -> font-display
    # we can't do this blindly, but we'll remove text-[11px] font-mono for headings and use font-display where it makes sense
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

