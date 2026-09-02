path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    c = f.read()

import re
# Add overflow-y-auto and max-h-[calc(100vh-8rem)] and data-lenis-prevent
old_sidebar = 'className="w-full lg:w-64 shrink-0 bg-white border border-rule-300 rounded-xl p-5 shadow-sm sticky top-28"'
new_sidebar = 'className="w-full lg:w-64 shrink-0 bg-white border border-rule-300 rounded-xl p-5 shadow-sm sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto" data-lenis-prevent="true"'

c = c.replace(old_sidebar, new_sidebar)

with open(path, 'w') as f:
    f.write(c)
