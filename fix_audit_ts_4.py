path = 'frontend/src/pages/AuditLogPage.tsx'
with open(path, 'r') as f:
    c = f.read()

import re
c = re.sub(r'e\.case_id\.includes', '(e.case_id || "").includes', c)
c = re.sub(r'e\.batch_id\.includes', '(e.batch_id || "").includes', c)

with open(path, 'w') as f:
    f.write(c)
