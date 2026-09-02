import re

path = 'frontend/src/pages/SettingsPage.tsx'
with open(path, 'r') as f:
    content = f.read()

# I will just replace ALL `</motion.div>` back to `</div>` except the very last one.
content = content.replace("</motion.div>", "</div>")
content = re.sub(r'</div>\n  \);\n};\n', '</motion.div>\n  );\n};\n', content)
content = re.sub(r'</div>\n  \);\n};\n\nexport default SettingsPage;', '</motion.div>\n  );\n};\n\nexport default SettingsPage;', content)

# I also need to ensure the opening tag is motion.div
if "<motion.div" not in content:
    content = content.replace('<div className="w-full', '<motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="w-full')
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';")

with open(path, 'w') as f:
    f.write(content)
