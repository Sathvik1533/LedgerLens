import re

path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix overall container layout: Give it max width and center it
old_main = """<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-paper-0 min-h-screen">"""
new_main = """<div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-paper-0 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">"""

if old_main in content:
    content = content.replace(old_main, new_main)
    # add the closing div at the very end
    content = content.replace("</div>\n  );\n};", "</div>\n      </div>\n  );\n};")

with open(path, 'w') as f:
    f.write(content)
