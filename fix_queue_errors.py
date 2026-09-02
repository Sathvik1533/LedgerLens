import re

path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix imports
content = content.replace("AlertCircle,\n  ArrowUpDown,\n", "")

# Use case_opened_at
content = content.replace("a.created_at", "a.case_opened_at")
content = content.replace("b.created_at", "b.case_opened_at")

# Fix amount_at_risk parsing
content = content.replace("b.amount_at_risk - a.amount_at_risk", "(parseFloat(b.amount_at_risk || '0') - parseFloat(a.amount_at_risk || '0'))")

# Fix total amount reduce
content = content.replace(
"""  const totalAmountAtRisk = processedCases.reduce((sum, item) => sum + item.amount_at_risk, 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });""", 
"""  const totalAmountAtRisk = processedCases.reduce((sum, item) => sum + parseFloat(item.amount_at_risk || '0'), 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });"""
)

# Add sort select back to use setSortBy
sort_select = """
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-paper-0 border border-rule-300 rounded-md px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-ink-900 transition-colors font-sans"
          >
            <option value="discrepancy">Sort: High Risk</option>
            <option value="amount">Sort: Amount</option>
            <option value="age">Sort: Age</option>
          </select>
"""
content = content.replace("          <select\n            value={selectedCategory}", sort_select + "\n          <select\n            value={selectedCategory}")

with open(path, 'w') as f:
    f.write(content)
