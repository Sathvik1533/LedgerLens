import os
import glob

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    # Replace text-slate-200, 300, 400 with text-ink-700
    # Replace text-slate-100, 50, white with text-ink-900
    # Replace text-slate-500, 600 with text-ink-700
    content = content.replace("text-slate-300", "text-ink-900")
    content = content.replace("text-slate-400", "text-ink-700")
    content = content.replace("text-slate-500", "text-ink-700")
    content = content.replace("text-slate-200", "text-ink-900")
    
    # Also replace any stray dark backgrounds that might still be there in cards
    content = content.replace("bg-slate-900/50", "bg-paper-1")
    content = content.replace("bg-slate-800/50", "bg-paper-0")
    content = content.replace("bg-slate-800", "bg-white")
    content = content.replace("bg-slate-900", "bg-paper-0")
    content = content.replace("border-slate-700", "border-rule-300")
    content = content.replace("border-slate-800", "border-rule-300")
    
    # Generic AI slop colors
    content = content.replace("text-gray-300", "text-ink-900")
    content = content.replace("text-gray-400", "text-ink-700")
    content = content.replace("text-gray-500", "text-ink-700")
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            fix_file(os.path.join(root, file))
