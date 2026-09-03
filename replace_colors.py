import os

replacements = {
    "bg-paper-0": "bg-canvas",
    "bg-paper-1": "bg-surface",
    "bg-white": "bg-surface",
    "border-rule-300": "border-border",
    "text-ink-900": "text-text-primary",
    "text-ink-700": "text-text-secondary",
    "fill-ink-900": "fill-text-primary",
    "bg-ink-900": "bg-surface-raised",
    "text-white": "text-text-primary",
    "text-source-blue": "text-accent",
    "bg-source-blue": "bg-accent",
    "border-source-blue": "border-accent",
    "text-matched-green": "text-resolved",
    "bg-matched-green": "bg-resolved",
    "border-matched-green": "border-resolved",
    "bg-matched-green/10": "bg-resolved-surface",
    "bg-matched-green/20": "bg-resolved-surface",
    "text-ledger-vermilion": "text-critical",
    "bg-ledger-vermilion": "bg-critical",
    "border-ledger-vermilion": "border-critical",
    "bg-ledger-vermilion/10": "bg-critical-surface",
    "bg-ledger-vermilion/80": "bg-critical",
    "text-advisory-amber": "text-high",
    "bg-advisory-amber": "bg-high",
    "border-advisory-amber": "border-high",
    "bg-advisory-amber/10": "bg-high-surface",
    "bg-advisory-amber/80": "bg-high",
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    modified = content
    # Process longest strings first to avoid partial replacements (e.g. bg-matched-green/10 before bg-matched-green)
    sorted_reps = sorted(replacements.keys(), key=len, reverse=True)
    
    for old in sorted_reps:
        modified = modified.replace(old, replacements[old])
        
    if content != modified:
        with open(filepath, 'w') as f:
            f.write(modified)
        print(f"Updated {filepath}")

for root, _, files in os.walk("frontend/src"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts") or file.endswith(".css"):
            process_file(os.path.join(root, file))

