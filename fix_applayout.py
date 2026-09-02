path = 'frontend/src/layouts/AppLayout.tsx'
with open(path, 'r') as f:
    c = f.read()

import re

# Find the start of motion.nav
start_idx = c.find('<motion.nav')
end_idx = c.find('</motion.nav>') + len('</motion.nav>')

if start_idx != -1 and end_idx != -1:
    nav_content = c[start_idx:end_idx]
    
    # We want to replace className="fixed top-6 left-1/2 -translate-x-1/2 ..." 
    # OR className="fixed top-4 md:top-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 ..."
    # with className="flex items-center p-1.5 bg-paper-0/80 backdrop-blur-xl border border-rule-300 rounded-full shadow-card max-w-full overflow-x-auto no-scrollbar pointer-events-auto"
    
    # Strip out the 'fixed ... z-50' stuff from className
    new_nav = re.sub(r'className="fixed[^"]+"', 'className="flex items-center p-1.5 bg-paper-0/80 backdrop-blur-xl border border-rule-300 rounded-full shadow-card max-w-full overflow-x-auto no-scrollbar pointer-events-auto"', nav_content)
    
    wrapper = f'<div className="fixed top-4 md:top-6 left-0 right-0 w-full z-50 flex justify-center pointer-events-none px-4">\n        {new_nav}\n      </div>'
    
    c = c[:start_idx] + wrapper + c[end_idx:]

with open(path, 'w') as f:
    f.write(c)
