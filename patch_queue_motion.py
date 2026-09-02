import re

path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add AnimatedCounter import
if "AnimatedCounter" not in content:
    content = content.replace("import { AmountDisplay }", "import { AnimatedCounter } from '../../components/AnimatedCounter';\nimport { AmountDisplay }")

# Replace totalAmountAtRisk string rendering with the raw number to feed into AnimatedCounter
content = content.replace(
"""  const totalAmountAtRisk = processedCases.reduce((sum, item) => sum + parseFloat(item.amount_at_risk || '0'), 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });""",
"  const totalAmountAtRisk = processedCases.reduce((sum, item) => sum + parseFloat(item.amount_at_risk || '0'), 0);"
)

# Replace the render of totalAmountAtRisk
content = content.replace(
    '<span className="text-2xl font-mono font-medium text-ledger-vermilion">₹{totalAmountAtRisk}</span>',
    '<div className="text-2xl font-mono font-medium text-ledger-vermilion flex items-center">₹<AnimatedCounter value={totalAmountAtRisk} />.00</div>'
)

# Add border-beam to Critical rows (limit 1 per page rule from INTERACTION-PATTERNS)
content = re.sub(
    r'className="hover:bg-paper-0 border-l-2 border-transparent hover:border-l-ink-900 transition-all cursor-pointer group"',
    r'className={`hover:bg-paper-0 border-l-2 border-transparent hover:border-l-ink-900 transition-all cursor-pointer group ${isCrit ? "border-beam" : ""}`}',
    content
)

with open(path, 'w') as f:
    f.write(content)
