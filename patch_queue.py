import re

path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add framer-motion import
if 'framer-motion' not in content:
    content = content.replace("import { useNavigate, useSearchParams } from 'react-router-dom';", "import { useNavigate, useSearchParams } from 'react-router-dom';\nimport { motion, AnimatePresence } from 'framer-motion';")

# Change tbody to <AnimatePresence initial={false}> and <tr> to <motion.tr>
content = content.replace('<tbody className="divide-y divide-white/[0.04] text-xs">', '<tbody className="divide-y divide-rule-300 text-xs">\n                <AnimatePresence initial={false}>')

tr_replace = """<motion.tr
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={item.case_id}
                      onClick={() => handleRowClick(item.case_id)}
                      className="hover:bg-source-blue/10 border-l-2 border-transparent hover:border-l-source-blue transition-colors cursor-pointer group"
                    >"""
content = re.sub(r'<tr[^>]*key=\{item.case_id\}[^>]*>', tr_replace, content, flags=re.DOTALL)

content = content.replace('</tbody', '</AnimatePresence>\n              </tbody')

# Fix motion.tr closing tag
content = content.replace('</tr>', '</motion.tr>')

# Fix divide-white
content = content.replace('divide-white/[0.04]', 'divide-rule-300')
content = content.replace('divide-white/[0.08]', 'divide-rule-300')

with open(path, 'w') as f:
    f.write(content)
