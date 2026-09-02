import re

path = 'frontend/src/layouts/AppLayout.tsx'
with open(path, 'r') as f:
    c = f.read()

# Make the dock responsive and prevent overflow
c = c.replace('className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-paper-0/80 backdrop-blur-xl border border-rule-300 rounded-full shadow-card"',
              'className="fixed top-4 md:top-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-between md:justify-start p-1.5 bg-paper-0/80 backdrop-blur-xl border border-rule-300 rounded-full shadow-card max-w-full overflow-x-auto no-scrollbar"')

c = c.replace('<div className="flex items-center gap-1 border-l border-rule-300 pl-3">',
              '<div className="flex items-center gap-1 md:gap-2 border-l border-rule-300 pl-2 md:pl-3">')

c = c.replace('className="relative flex items-center px-4 py-2 rounded-full group transition-colors"',
              'className="relative flex items-center px-3 md:px-4 py-2 rounded-full group transition-colors shrink-0"')

c = c.replace('hidden lg:block', 'hidden xl:block')

with open(path, 'w') as f:
    f.write(c)
