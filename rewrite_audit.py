path = 'frontend/src/pages/AuditLogPage.tsx'
with open(path, 'r') as f:
    c = f.read()

# Fix placeholder
c = c.replace('placeholder-[#829BB8]/50', 'placeholder-ink-700/60 bg-white shadow-sm')

# Use CustomSelect instead of native selects
if "CustomSelect" not in c:
    c = c.replace("import { Search, Shield, Filter, RefreshCw }", "import { Search, Shield, Filter, RefreshCw } from 'lucide-react';\nimport { CustomSelect } from '../components/CustomSelect';\nimport { Search as S }") # Hack to avoid double import, wait let's just do it cleanly

with open(path, 'w') as f:
    f.write(c)
