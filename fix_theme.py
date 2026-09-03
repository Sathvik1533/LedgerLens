with open("frontend/tailwind.config.js", "r") as f:
    t = f.read()

# Update fonts for Direction A
t = t.replace("display: ['\"Plus Jakarta Sans\"', 'sans-serif'],", "display: ['Manrope', 'sans-serif'],")
t = t.replace("sans: ['Inter', 'sans-serif'],", "sans: ['Inter', 'sans-serif'],") # Already Inter
t = t.replace("mono: ['Inter', 'sans-serif'],", "mono: ['Geist Mono', 'monospace'],") # Restore restricted mono

# Update colors for Direction A
t = t.replace("'paper-0': '#FAFAFA',", "'paper-0': '#F9F9FB',")
t = t.replace("'paper-1': '#FFFFFF',", "'paper-1': '#FFFFFF',")
t = t.replace("'ink-900': '#1A1A1A',", "'ink-900': '#111827',")
t = t.replace("'ink-700': '#666666',", "'ink-700': '#4B5563',")
t = t.replace("'rule-300': '#EAEAEA',", "'rule-300': '#E5E7EB',")
t = t.replace("'source-blue': '#2563EB',", "'source-blue': '#2563EB',")
t = t.replace("'ledger-vermilion': '#E11D48',", "'ledger-vermilion': '#DC2626',")
t = t.replace("'advisory-amber': '#F59E0B',", "'advisory-amber': '#D97706',")
t = t.replace("'matched-green': '#10B981',", "'matched-green': '#059669',")

with open("frontend/tailwind.config.js", "w") as f:
    f.write(t)

with open("frontend/index.html", "r") as f:
    i = f.read()

# Update Google fonts link
i = i.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">'
)
with open("frontend/index.html", "w") as f:
    f.write(i)

