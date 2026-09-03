import re

with open("frontend/src/App.tsx", "r") as f:
    c = f.read()

import_statement = "import { TooltipProvider } from './components/Tooltip';\n"
if "import { TooltipProvider }" not in c:
    c = c.replace("import Lenis from 'lenis';", "import Lenis from 'lenis';\n" + import_statement)

c = c.replace("<BrowserRouter>", "<TooltipProvider>\n    <BrowserRouter>")
c = c.replace("</BrowserRouter>", "</BrowserRouter>\n    </TooltipProvider>")

with open("frontend/src/App.tsx", "w") as f:
    f.write(c)
