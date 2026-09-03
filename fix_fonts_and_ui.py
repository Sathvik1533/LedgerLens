import os

# 1. index.html
with open("frontend/index.html", "r") as f:
    c = f.read()
c = c.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">'
)
with open("frontend/index.html", "w") as f:
    f.write(c)

# 2. tailwind.config.js
with open("frontend/tailwind.config.js", "r") as f:
    t = f.read()
t = t.replace(
    "mono: ['JetBrains Mono', 'monospace'],",
    "mono: ['Inter', 'sans-serif'],"
)
t = t.replace(
    "display: ['Inter', 'sans-serif'],",
    "display: ['\"Plus Jakarta Sans\"', 'sans-serif'],"
)
t = t.replace(
    "sans: ['Inter', 'sans-serif'],",
    "sans: ['Inter', 'sans-serif'],"
)
with open("frontend/tailwind.config.js", "w") as f:
    f.write(t)

# 3. QueuePage overscroll-contain
with open("frontend/src/pages/app/QueuePage.tsx", "r") as f:
    q = f.read()
q = q.replace(
    'max-h-[calc(100vh-8rem)] overflow-y-auto" data-lenis-prevent="true"',
    'max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain" data-lenis-prevent="true"'
)
with open("frontend/src/pages/app/QueuePage.tsx", "w") as f:
    f.write(q)

