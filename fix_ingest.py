with open("frontend/src/pages/IngestionFeedsPage.tsx", "r") as f:
    c = f.read()

c = c.replace('verify ACID duplicate-batch idempotency safely without corrupting the production ledger.', 'verify uploading behavior safely without corrupting the active ledger.')
c = c.replace('Custom Idempotency Key', 'Duplicate Prevention Key')
c = c.replace('>X-Idempotency-Key</span>', '>(Batch ID)</span>')
c = c.replace('Idempotency Invariants', 'Data Protections')
c = c.replace('Attributed Traceability', 'Permanent Audit Trail')
c = c.replace(
    'Every ingestion lifecycle emits an immutable append-only audit event, cryptographically tying the raw CSV row to its normalized, internal database ID.',
    'Every uploaded row is permanently recorded with a timestamp, ensuring clear visibility into who uploaded what data and when.'
)
c = c.replace('<th>Idempotency Key</th>', '<th>Batch Key</th>') # if exact match fails, use general replace
c = c.replace('>Idempotency Key</th>', '>Batch Key</th>')

with open("frontend/src/pages/IngestionFeedsPage.tsx", "w") as f:
    f.write(c)
