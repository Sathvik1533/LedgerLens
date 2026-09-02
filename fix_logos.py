import re

# MarketingLayout
path1 = 'frontend/src/layouts/MarketingLayout.tsx'
with open(path1, 'r') as f:
    c1 = f.read()
if "import { Logo } from '../components/Logo';" not in c1:
    c1 = c1.replace("import { Link, Outlet, useLocation } from 'react-router-dom';", "import { Link, Outlet, useLocation } from 'react-router-dom';\nimport { Logo } from '../components/Logo';")
    c1 = re.sub(r'<div className="h-6 w-6 bg-ink-900 text-paper-0 flex items-center justify-center font-display font-bold text-xs rounded shadow-sm">\s*LL\s*</div>', '<Logo className="w-8 h-8" />', c1)
    with open(path1, 'w') as f:
        f.write(c1)

# AppLayout (or Navbar)
path2 = 'frontend/src/layouts/AppLayout.tsx'
with open(path2, 'r') as f:
    c2 = f.read()
if "import { Logo } from '../components/Logo';" not in c2:
    c2 = c2.replace("import { NavLink, Outlet, useNavigate } from 'react-router-dom';", "import { NavLink, Outlet, useNavigate } from 'react-router-dom';\nimport { Logo } from '../components/Logo';")
    c2 = re.sub(r'<div className="h-6 w-6 bg-ink-900 text-paper-0 flex items-center justify-center font-display font-bold text-xs rounded shadow-sm shrink-0">\s*LL\s*</div>', '<Logo className="w-8 h-8 shrink-0" />', c2)
    with open(path2, 'w') as f:
        f.write(c2)
