import re

path = 'frontend/src/layouts/AppLayout.tsx'
with open(path, 'r') as f:
    c = f.read()

# Replace the broken framer motion nav
old_nav_start = """<motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-4 md:top-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-between md:justify-start p-1.5 bg-paper-0/80 backdrop-blur-xl border border-rule-300 rounded-full shadow-card max-w-full overflow-x-auto no-scrollbar"
      >"""

new_nav_start = """<div className="fixed top-4 md:top-6 left-0 right-0 w-full z-50 flex justify-center pointer-events-none px-4">
        <motion.nav 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex items-center p-1.5 bg-paper-0/80 backdrop-blur-xl border border-rule-300 rounded-full shadow-card max-w-full overflow-x-auto no-scrollbar pointer-events-auto"
        >"""

# If the previous patch somehow didn't apply exactly as above, let's use regex to be safe
import re
c = re.sub(
    r'<motion\.nav[^>]+className="fixed[^>]+>',
    new_nav_start,
    c,
    flags=re.DOTALL
)

# Need to close the wrapper div
c = c.replace('</motion.nav>', '</motion.nav>\n      </div>')

# Wait, the regex might fail if it doesn't match perfectly. Let's do a manual string replace on the exact text.
