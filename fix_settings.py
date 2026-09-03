with open("frontend/src/pages/SettingsPage.tsx", "r") as f:
    c = f.read()

# 1. Evidence Settings
c = c.replace('Grounded AI Safety Guardrails', 'Evidence Confidence Settings')
c = c.replace('<span className="text-xs font-mono text-cyan-400">pgvector cosine</span>', '')
c = c.replace('Policy Grounding Confidence Floor', 'Minimum Policy Confidence')
c = c.replace('Cosine &ge; {cosineFloor}', 'Score &ge; {cosineFloor}')
c = c.replace(
    'Retrieval vectors below this threshold trigger an automatic fallback to manual policy inspection to prevent hallucinated advice.',
    'Policy matches below this confidence level trigger a fallback to manual inspection.'
)

# 2. Concurrency Controls
c = c.replace('Concurrency Controls', 'System Protections')
c = c.replace('Optimistic CAS Versioning', 'Review Overwrite Protection')
c = c.replace(
    'Enforces strict lock versions (`lock_version=vN`). Concurrent modifications reject stale reviews with HTTP 409.',
    'Prevents one reviewer from overwriting a newer decision if they both open the case at the same time.'
)

c = c.replace('Batch Idempotency Keying', 'Duplicate File Prevention')
c = c.replace(
    '`X-Idempotency-Key` prevents duplicate ingestion runs across payments and gateway settlement feeds.',
    'Ensures that uploading the same file twice does not create duplicate financial records.'
)

c = c.replace('Monetary Scale Precision', 'Mathematical Accuracy')
c = c.replace(
    'PostgreSQL `NUMERIC(15,2)` and Python `Decimal` penny-exact math. Zero IEEE-754 floating-point drift.',
    'The system uses exact penny-level math for all calculations instead of approximations, preventing invisible rounding errors.'
)

# 3. System Architecture Disclosure
c = c.replace(
    '<h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">\n                System Architecture & Capabilities (Static Info)\n              </h3>',
    '<h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">\n                Technical Details\n              </h3>'
)

# 4. Button style bug
c = c.replace('bg-ink-900 hover:bg-ink-700 text-ink-900 font-semibold', 'bg-ink-900 hover:bg-ink-700 text-white font-semibold focus-ring')

with open("frontend/src/pages/SettingsPage.tsx", "w") as f:
    f.write(c)
