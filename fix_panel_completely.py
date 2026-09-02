import re

path = 'frontend/src/components/RagCopilotPanel.tsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace("import {", "import { motion, AnimatePresence } from 'framer-motion';\nimport {")

# 2. Generic styles removal
content = content.replace('bg-[#020713]/90', 'bg-paper-1')
content = content.replace('hover:bg-[#08142C]', 'hover:bg-paper-0')
content = content.replace('text-[#FFFAF4]', 'text-ink-900')
content = content.replace('bg-[#030B1B]', 'bg-paper-1')
content = content.replace('text-[#829BB8]', 'text-ink-700')
content = content.replace('border-white/[0.08]', 'border-rule-300')
content = content.replace('border-white/[0.06]', 'border-rule-300')
content = content.replace('bg-[#020713]/40', 'bg-paper-1')
content = content.replace('text-sky-400', 'text-advisory-amber')
content = content.replace('<Sparkles ', '<BookOpen ')
content = content.replace('shadow-lg', 'shadow-none')
content = content.replace('shadow-sm', 'shadow-none')
content = content.replace('shadow-glow-cyan', 'shadow-none')
content = content.replace('bg-emerald-950/60', 'bg-matched-green/10')
content = content.replace('border-emerald-500/30', 'border-matched-green')
content = content.replace('text-emerald-300', 'text-matched-green')
content = content.replace('text-emerald-400', 'text-matched-green')
content = content.replace('bg-amber-950/60', 'bg-advisory-amber/10')
content = content.replace('border-amber-500/30', 'border-advisory-amber')
content = content.replace('text-amber-300', 'text-advisory-amber')
content = content.replace('text-amber-400', 'text-advisory-amber')
content = content.replace('bg-rose-950/40', 'bg-ledger-vermilion/10')
content = content.replace('border-rose-500/30', 'border-ledger-vermilion')
content = content.replace('text-rose-300', 'text-ledger-vermilion')
content = content.replace('text-rose-400', 'text-ledger-vermilion')
content = content.replace('border-ledger-vermilion', 'border-ledger-vermilion')
content = content.replace('bg-blue-950/40', 'bg-paper-1')
content = content.replace('text-blue-300', 'text-ink-900')
content = content.replace('bg-blue-600', 'bg-ink-900')
content = content.replace('hover:bg-blue-500', 'hover:bg-ink-700')

# 3. Add Motion (AnimatePresence over the accordion body)
content = content.replace(
    '{isExpanded && (', 
    '<AnimatePresence initial={false}>\n      {isExpanded && (\n        <motion.div\n          initial={{ height: 0, opacity: 0 }}\n          animate={{ height: "auto", opacity: 1 }}\n          exit={{ height: 0, opacity: 0 }}\n          transition={{ duration: 0.2, ease: "easeOut" }}\n          className="overflow-hidden"\n        >'
)

content = content.replace(
    '  )\n}', 
    '  )\n}\n//' # Just a safety anchor
)

# find the closing bracket for {isExpanded && ( ... )}
# It's at the end of the file before the main div closes
content = content.replace(
    '          )}\n        </div>\n      )}\n    </div>\n  );\n};',
    '          )}\n        </div>\n        </motion.div>\n      )}\n      </AnimatePresence>\n    </div>\n  );\n};'
)


with open(path, 'w') as f:
    f.write(content)
