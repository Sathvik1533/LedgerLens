with open("frontend/src/layouts/MarketingLayout.tsx", "r") as f:
    c = f.read()

# Change from fixed floating nav to static standard nav
c = c.replace('className="fixed top-0 left-0 right-0 z-50 bg-paper-0/80 backdrop-blur-md border-b border-rule-300"',
              'className="static w-full bg-paper-1 border-b border-rule-300 z-50"')
c = c.replace('className="min-h-screen bg-paper-0 font-sans text-ink-900 selection:bg-source-blue/20"',
              'className="min-h-screen bg-paper-0 font-sans text-ink-900 selection:bg-source-blue/20 flex flex-col"')

with open("frontend/src/layouts/MarketingLayout.tsx", "w") as f:
    f.write(c)
