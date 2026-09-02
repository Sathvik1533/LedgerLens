import re

path = 'frontend/src/components/ReviewActionForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Imports
if 'framer-motion' not in content:
    content = content.replace("import {", "import { motion, AnimatePresence } from 'framer-motion';\nimport {")

# 409 Alert
old_alert = """{conflictError && (
        <div"""
new_alert = """<AnimatePresence>
      {conflictError && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
"""
content = content.replace(old_alert, new_alert)

# Close AnimatePresence for conflictError
old_alert_close = """<span>Refresh Case Data</span>
          </button>
        </div>
      )}"""
new_alert_close = """<span>Refresh Case Data</span>
          </button>
        </motion.div>
      )}
      </AnimatePresence>"""
content = content.replace(old_alert_close, new_alert_close)

# Standard Error Message
old_err = """{errorMsg && !conflictError && (
        <div"""
new_err = """<AnimatePresence>
      {errorMsg && !conflictError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
"""
content = content.replace(old_err, new_err)

old_err_close = """<span>{errorMsg}</span>
        </div>
      )}"""
new_err_close = """<span>{errorMsg}</span>
        </motion.div>
      )}
      </AnimatePresence>"""
content = content.replace(old_err_close, new_err_close)

with open(path, 'w') as f:
    f.write(content)
