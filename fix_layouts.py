with open("frontend/src/layouts/MarketingLayout.tsx", "r") as f:
    c = f.read()

# Make marketing nav static
c = c.replace(
    '<nav className="fixed top-0 w-full z-50 bg-paper-0/80 backdrop-blur-xl border-b border-rule-300">',
    '<nav className="w-full bg-paper-0 border-b border-rule-300">'
)
c = c.replace('<main className="flex-1 mt-16">', '<main className="flex-1">')

with open("frontend/src/layouts/MarketingLayout.tsx", "w") as f:
    f.write(c)

with open("frontend/src/layouts/AppLayout.tsx", "r") as f:
    c = f.read()

# Make app nav static header
c = c.replace(
    '<div className="fixed top-4 md:top-6 left-0 right-0 w-full z-50 flex justify-center pointer-events-none px-4">',
    '<div className="w-full border-b border-rule-300 bg-paper-0 flex justify-center px-4 py-3">'
)
c = c.replace(
    'className="flex items-center p-1.5 bg-paper-0/80 backdrop-blur-xl border border-rule-300 rounded-full shadow-card max-w-full overflow-x-auto no-scrollbar pointer-events-auto"',
    'className="flex items-center p-1.5 max-w-full overflow-x-auto no-scrollbar"'
)
c = c.replace('<main className="flex-1 min-h-screen pt-32 pb-12 relative flex flex-col bg-paper-0">', '<main className="flex-1 pb-12 relative flex flex-col bg-paper-0">')

with open("frontend/src/layouts/AppLayout.tsx", "w") as f:
    f.write(c)
