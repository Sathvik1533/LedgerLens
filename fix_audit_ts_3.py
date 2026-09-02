path = 'frontend/src/pages/AuditLogPage.tsx'
with open(path, 'r') as f:
    c = f.read()

import re
# Find something like: e.case_id.toLowerCase().includes
c = re.sub(r'e\.case_id\.toLowerCase', '(e.case_id || "").toLowerCase', c)
c = re.sub(r'e\.batch_id\.toLowerCase', '(e.batch_id || "").toLowerCase', c)

with open(path, 'w') as f:
    f.write(c)
