import re

path = 'frontend/src/pages/IngestionFeedsPage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix imports
content = content.replace("import { fetchSystemStatus, uploadSyntheticBatch } from '../api/client';", "import { fetchIngestionStatus, uploadFeedCsv } from '../api/client';")
content = content.replace("import { SystemStatusResponse } from '../types/api';", "import { IngestionStatusResponse } from '../types/api';")

# Fix missing CheckCircle2 import
content = content.replace("Check,\n  Shield", "Check,\n  CheckCircle2,\n  Shield")

# Fix function calls
content = content.replace("useState<SystemStatusResponse | null>", "useState<IngestionStatusResponse | null>")
content = content.replace("await fetchSystemStatus()", "await fetchIngestionStatus()")
content = content.replace("await uploadSyntheticBatch(selectedFeed, file, idempotencyKey || undefined)", "await uploadFeedCsv(selectedFeed, file, idempotencyKey || undefined)")

# Fix any types in map
content = content.replace("statusData.batches.map((b) => (", "statusData.batches.map((b: any) => (")

with open(path, 'w') as f:
    f.write(content)

path2 = 'frontend/src/pages/marketing/LandingPage.tsx'
with open(path2, 'r') as f:
    c = f.read()
c = c.replace(", CheckCircle2 }", " }")
with open(path2, 'w') as f:
    f.write(c)
