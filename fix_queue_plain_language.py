import re

with open("frontend/src/pages/app/QueuePage.tsx", "r") as f:
    c = f.read()

c = c.replace(
    "import { ExceptionBadge } from '../../components/ExceptionBadge';",
    "import { ExceptionBadge, EXCEPTION_CONFIG } from '../../components/ExceptionBadge';\nimport { Tooltip } from '../../components/Tooltip';"
)

c = re.sub(r'const getPlainLanguageSummary[\s\S]*?default: return "Manual investigation required for financial discrepancy.";\n  \}\n\}', '', c)

c = c.replace("{getPlainLanguageSummary(item)}", "{EXCEPTION_CONFIG[item.exception_type]?.explanation || 'Manual investigation required for financial discrepancy.'}")

with open("frontend/src/pages/app/QueuePage.tsx", "w") as f:
    f.write(c)
