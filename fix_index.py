path = 'frontend/index.html'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet">'
)

content = content.replace(
    '<body class="bg-canvas text-slate-100 min-h-screen font-sans antialiased">',
    '<body class="bg-paper-0 text-ink-900 min-h-screen font-sans antialiased">'
)

with open(path, 'w') as f:
    f.write(content)
