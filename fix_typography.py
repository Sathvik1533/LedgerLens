import re

# 1. Fix tailwind.config.js
tw_path = 'frontend/tailwind.config.js'
with open(tw_path, 'r') as f:
    c = f.read()

c = c.replace("'DM Sans', 'sans-serif'", "'Inter', 'sans-serif'")
c = c.replace("'DM Mono', 'monospace'", "'JetBrains Mono', 'monospace'")
c = c.replace("'Fraunces', 'serif'", "'Inter', 'sans-serif'")

with open(tw_path, 'w') as f:
    f.write(c)

# 2. Fix index.html
html_path = 'frontend/index.html'
with open(html_path, 'r') as f:
    hc = f.read()

# Replace google fonts links
hc = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=.*?" rel="stylesheet">', '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">', hc, flags=re.DOTALL)

with open(html_path, 'w') as f:
    f.write(hc)
