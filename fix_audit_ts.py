path = 'frontend/src/pages/AuditLogPage.tsx'
with open(path, 'r') as f:
    c = f.read()

# Fix MOCK_FALLBACK
c = c.replace("const MOCK_FALLBACK: AuditEventItem[] = [];\n", "")

# Fix loading
c = c.replace("const [loading, setLoading] = useState(true);", "const [isLoading, setIsLoading] = useState(true);")
c = c.replace("setLoading(true);", "setIsLoading(true);")
c = c.replace("setLoading(false);", "setIsLoading(false);")

# Fix type
c = c.replace("e.type", "e.event_type")
c = c.replace("setSelectedType(val as any)}", "setSelectedType(val)}")

# Fix nulls in filter
c = c.replace("e.case_id.toLowerCase()", "(e.case_id || '').toLowerCase()")
c = c.replace("e.batch_id.toLowerCase()", "(e.batch_id || '').toLowerCase()")

with open(path, 'w') as f:
    f.write(c)
