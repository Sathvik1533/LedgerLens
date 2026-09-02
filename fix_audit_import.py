path = 'frontend/src/pages/AuditLogPage.tsx'
with open(path, 'r') as f:
    c = f.read()

c = c.replace("import { useState, useMemo } from 'react';", "import { useState, useMemo, useEffect } from 'react';")

with open(path, 'w') as f:
    f.write(c)
