import re

# Fix SettingsPage
with open("frontend/src/pages/SettingsPage.tsx", "r") as f:
    c = f.read()

c = c.replace(
    "import { motion } from 'framer-motion';",
    "import { motion } from 'framer-motion';\nimport { Tooltip } from '../components/Tooltip';"
)

c = c.replace(
    "<span>Review Overwrite Protection</span>",
    "<Tooltip content=\"Optimistic CAS Versioning\"><span className=\"border-b border-dashed border-rule-300 cursor-help\">Review Overwrite Protection</span></Tooltip>"
)
c = c.replace(
    "<span>Duplicate File Prevention</span>",
    "<Tooltip content=\"Batch Idempotency Keying\"><span className=\"border-b border-dashed border-rule-300 cursor-help\">Duplicate File Prevention</span></Tooltip>"
)
c = c.replace(
    "<span>Evidence Confidence Settings</span>",
    "<Tooltip content=\"pgvector cosine grounding\"><span className=\"border-b border-dashed border-rule-300 cursor-help\">Evidence Confidence Settings</span></Tooltip>"
)

with open("frontend/src/pages/SettingsPage.tsx", "w") as f:
    f.write(c)

# Fix DashboardPage
with open("frontend/src/pages/DashboardPage.tsx", "r") as f:
    c = f.read()

c = c.replace(
    "import { motion } from 'framer-motion';",
    "import { motion } from 'framer-motion';\nimport { Tooltip } from '../components/Tooltip';"
)

c = c.replace(
    "<span>Ingested &amp; Normalized</span>",
    "<Tooltip content=\"Deterministic 3-Way Parity\"><span className=\"border-b border-dashed border-rule-300 cursor-help\">Ingested &amp; Normalized</span></Tooltip>"
)

c = c.replace(
    "<span>Double-Credit Guarded</span>",
    "<Tooltip content=\"Idempotent Credit Pipeline\"><span className=\"border-b border-dashed border-rule-300 cursor-help\">Double-Credit Guarded</span></Tooltip>"
)

with open("frontend/src/pages/DashboardPage.tsx", "w") as f:
    f.write(c)

