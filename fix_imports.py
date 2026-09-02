import re

def fix_imports(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # Remove all "import { motion, AnimatePresence } from 'framer-motion';"
    content = re.sub(r"import\s*\{\s*motion,\s*AnimatePresence\s*\}\s*from\s*'framer-motion';\n", "", content)
    
    # Add it exactly once at the top
    content = "import { motion, AnimatePresence } from 'framer-motion';\n" + content
    
    # Fix BookOpen missing in RagCopilotPanel
    if 'BookOpen' not in content and 'lucide-react' in content:
        content = content.replace("import {\n  Sparkles,", "import {\n  BookOpen,\n  Sparkles,")

    with open(path, 'w') as f:
        f.write(content)

fix_imports('frontend/src/components/RagCopilotPanel.tsx')
fix_imports('frontend/src/components/ReviewActionForm.tsx')
