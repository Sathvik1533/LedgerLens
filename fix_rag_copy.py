with open("frontend/src/components/RagCopilotPanel.tsx", "r") as f:
    c = f.read()

import re
# Change "Notice: Policy guidance is read-only advice. Financial resolution decisions are executed by authorized human reviewers in the Decision Panel."
c = c.replace(
    "Notice: Policy guidance is read-only advice. Financial resolution decisions are executed by authorized human reviewers in the Decision Panel.",
    "Policy guidance is read-only. You remain in control."
)

# Tooltip for grounding/is_confident
# First check where is_confident is used.
with open("frontend/src/components/RagCopilotPanel.tsx", "w") as f:
    f.write(c)
