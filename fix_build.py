import re
import os

path = 'frontend/src/pages/marketing/HowItWorksPage.tsx'
with open(path, 'r') as f:
    c = f.read()
c = c.replace('type: "spring"', 'type: "spring" as const')
c = c.replace('import React from \'react\';\n', '')
c = c.replace('ShieldCheck, ', '')
c = c.replace(', ArrowRight', '')
with open(path, 'w') as f:
    f.write(c)

path = 'frontend/src/layouts/MarketingLayout.tsx'
with open(path, 'r') as f:
    c = f.read()
# Let's see if <Logo is used but not imported
if "import { Logo }" not in c:
    c = c.replace("import { Link, Outlet, useLocation } from 'react-router-dom';", "import { Link, Outlet, useLocation } from 'react-router-dom';\nimport { Logo } from '../components/Logo';")
with open(path, 'w') as f:
    f.write(c)
