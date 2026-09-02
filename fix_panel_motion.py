import re

path = 'frontend/src/components/RagCopilotPanel.tsx'
with open(path, 'r') as f:
    content = f.read()

# Imports
if 'framer-motion' not in content:
    content = content.replace("import {", "import { motion, AnimatePresence } from 'framer-motion';\nimport {")

# Accordion Body
old_body = """{isExpanded && (
        <div className="p-4 space-y-3.5 text-xs border-t border-rule-300 bg-paper-1/40">"""
new_body = """<AnimatePresence>
      {isExpanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="p-4 space-y-3.5 text-xs border-t border-rule-300 bg-paper-1/40">"""

content = content.replace(old_body, new_body)

# Close AnimatePresence
content = content.replace("""</div>
      )}
    </div>
  );""", """</div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );""")

with open(path, 'w') as f:
    f.write(content)
