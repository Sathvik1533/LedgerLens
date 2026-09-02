import re

path = 'frontend/src/pages/marketing/EvaluationPage.tsx'
with open(path, 'r') as f:
    c = f.read()

c = c.replace('import React from \'react\';\n', '')
c = c.replace(', FileText', '')
c = c.replace('type: "spring"', 'type: "spring" as const')

with open(path, 'w') as f:
    f.write(c)
