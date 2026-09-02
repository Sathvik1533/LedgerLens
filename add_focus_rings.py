import os

def update_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # Add Vercel-grade focus visible rings to inputs and buttons
    new_content = content.replace(
        'focus:outline-none focus:border-source-blue',
        'focus:outline-none focus:border-source-blue focus-visible:ring-2 focus-visible:ring-source-blue/20 focus-visible:border-source-blue transition-all'
    )
    new_content = new_content.replace(
        'focus:outline-none focus:border-ink-900',
        'focus:outline-none focus:border-ink-900 focus-visible:ring-2 focus-visible:ring-ink-900/20 focus-visible:border-ink-900 transition-all'
    )
    
    # Specific fix for button in CustomSelect
    new_content = new_content.replace(
        'focus:outline-none focus:border-ink-900 transition-colors shadow-sm',
        'focus:outline-none focus:border-ink-900 focus-visible:ring-2 focus-visible:ring-ink-900/20 transition-all shadow-sm'
    )

    if new_content != content:
        with open(path, 'w') as f:
            f.write(new_content)
        return True
    return False

components_dir = 'frontend/src/components'
pages_dir = 'frontend/src/pages'

for root, _, files in os.walk(components_dir):
    for f in files:
        if f.endswith('.tsx'):
            update_file(os.path.join(root, f))

for root, _, files in os.walk(pages_dir):
    for f in files:
        if f.endswith('.tsx'):
            update_file(os.path.join(root, f))
