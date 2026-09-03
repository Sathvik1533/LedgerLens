with open("frontend/src/components/ReviewActionForm.tsx", "r") as f:
    c = f.read()

# Add Tooltip import
if "import { Tooltip }" not in c:
    c = c.replace("import { submitReview } from '../api/client';", "import { Tooltip } from './Tooltip';\nimport { submitReview } from '../api/client';")

# 1. Stale Version Conflict
old_conflict = '<span className="font-semibold text-ink-700">Stale Version Conflict (HTTP 409)</span>'
new_conflict = '''<Tooltip content="Your action was not saved because someone updated this case first.">
                <span tabIndex={0} className="font-semibold text-ink-700 focus-ring">Case changed by another reviewer</span>
              </Tooltip>'''
c = c.replace(old_conflict, new_conflict)

# 2. Expected Version & Atomic CAS footer
old_footer = '''<div className="flex items-center justify-between text-[10px] text-ink-700 font-mono">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-source-blue" aria-hidden="true" />
            Expected Version: {evidence.version}
          </span>
          <span className="text-ink-700">Atomic CAS</span>
        </div>'''
new_footer = '''<div className="flex items-center justify-between text-[10px] text-ink-700 font-mono">
          <Tooltip content="The version used to prevent overwriting another reviewer's update.">
          <span tabIndex={0} className="flex items-center gap-1 focus-ring">
            <Lock className="w-3 h-3 text-source-blue" aria-hidden="true" />
            Case version: {evidence.version}
          </span>
          </Tooltip>
          <Tooltip content="Prevents one reviewer from overwriting a newer decision.">
          <span tabIndex={0} className="text-ink-700 focus-ring">Safe update protection</span>
          </Tooltip>
        </div>'''
c = c.replace(old_footer, new_footer)

with open("frontend/src/components/ReviewActionForm.tsx", "w") as f:
    f.write(c)
