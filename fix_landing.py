import re

path = 'frontend/src/pages/marketing/LandingPage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix types and unused imports
content = content.replace('type: "spring"', 'type: "spring" as const')
content = content.replace("useAnimation, useScroll, useTransform", "useScroll")
content = content.replace("CheckCircle2, ", "")
content = content.replace("const y = useTransform(scrollYProgress, [0, 1], [0, 200]);", "")
content = content.replace("import React, { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';")

with open(path, 'w') as f:
    f.write(content)
