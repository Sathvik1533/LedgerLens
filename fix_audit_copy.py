with open("frontend/src/pages/AuditLogPage.tsx", "r") as f:
    c = f.read()

if "import { Tooltip }" not in c:
    c = c.replace("import { CustomSelect }", "import { Tooltip } from '../components/Tooltip';\nimport { CustomSelect }")

# Change Cryptographic CAS
c = c.replace(
    '<Shield className="w-3.5 h-3.5 text-matched-green" /> Cryptographic CAS',
    '<Shield className="w-3.5 h-3.5 text-matched-green" /> Permanent Record'
)

# Tooltip for Event Type
old_event = '<span className="font-mono text-xs font-semibold text-ledger-vermilion">{evt.event_type}</span>'
new_event = '''<Tooltip content="The system event type recorded in the database.">
                      <span tabIndex={0} className="font-mono text-xs font-semibold text-ledger-vermilion focus-ring">{evt.event_type}</span>
                    </Tooltip>'''
c = c.replace(old_event, new_event)

with open("frontend/src/pages/AuditLogPage.tsx", "w") as f:
    f.write(c)
