import re
import os

pages = [
    'frontend/src/pages/app/CasePage.tsx',
    'frontend/src/pages/DashboardPage.tsx',
    'frontend/src/pages/AuditLogPage.tsx',
    'frontend/src/pages/PolicyKnowledgePage.tsx',
    'frontend/src/pages/SettingsPage.tsx',
]

for path in pages:
    if not os.path.exists(path):
        continue
    with open(path, 'r') as f:
        content = f.read()

    # DashboardPage
    content = content.replace('className="space-y-8 max-w-7xl mx-auto font-sans"', 'className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans"')
    
    # CasePage
    content = content.replace('className="space-y-6 max-w-7xl mx-auto font-sans"', 'className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans"')
    # Add framer-motion import to CasePage if missing
    if "from 'framer-motion'" not in content:
        content = content.replace("import { useParams, useNavigate } from 'react-router-dom';", "import { useParams, useNavigate } from 'react-router-dom';\nimport { motion } from 'framer-motion';")
        content = content.replace('<div className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans">', '<motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans">')
        content = content.replace('</button>\n      </div>\n    );\n  }\n\n  return (\n    <div', '</button>\n      </div>\n    );\n  }\n\n  return (\n    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}')
        # Need to fix the closing div to </motion.div>
        content = re.sub(r'</div>\n  \);\n};\n$', '</motion.div>\n  );\n};\n', content)
        content = re.sub(r'</div>\n  \);\n};\n\nexport default CaseDetailPage;', '</motion.div>\n  );\n};\n\nexport default CaseDetailPage;', content)

    # AuditLogPage
    content = content.replace('className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans"', 'className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans"')
    
    # PolicyKnowledgePage
    content = content.replace('className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans space-y-6"', 'className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans"')
    
    # SettingsPage
    content = content.replace('className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto font-sans space-y-6"', 'className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans"')

    with open(path, 'w') as f:
        f.write(content)
