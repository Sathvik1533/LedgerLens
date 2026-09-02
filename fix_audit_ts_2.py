path = 'frontend/src/pages/AuditLogPage.tsx'
with open(path, 'r') as f:
    c = f.read()

c = c.replace("const [isLoading, setIsLoading] = useState(true);", "")
c = c.replace("setIsLoading(true);", "")
c = c.replace("setIsLoading(false);", "")
c = c.replace("e.case_id.toLowerCase()", "(e.case_id || '').toLowerCase()")
c = c.replace("e.batch_id.toLowerCase()", "(e.batch_id || '').toLowerCase()")

with open(path, 'w') as f:
    f.write(c)
