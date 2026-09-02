import re

path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    c = f.read()

# Add CustomSelect import
if "CustomSelect" not in c:
    c = c.replace("import { EmptyState } from '../../components/EmptyState';", "import { EmptyState } from '../../components/EmptyState';\nimport { CustomSelect } from '../../components/CustomSelect';")

# Replace Category Select
category_select = """<select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-paper-0 border border-rule-300 rounded-md px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-ink-900 transition-colors appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="amount_mismatch">Amount Mismatch</option>
                <option value="fee_mismatch">Fee & Tax Mismatch</option>
                <option value="missing_settlement">Missing Settlement</option>
                <option value="missing_bank_credit">Missing Bank Credit</option>
                <option value="duplicate_payment">Duplicate Payment</option>
                <option value="partial_refund_not_reflected">Unadjusted Refund</option>
              </select>"""

custom_category = """<CustomSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'amount_mismatch', label: 'Amount Mismatch' },
                  { value: 'fee_mismatch', label: 'Fee & Tax Mismatch' },
                  { value: 'missing_settlement', label: 'Missing Settlement' },
                  { value: 'missing_bank_credit', label: 'Missing Bank Credit' },
                  { value: 'duplicate_payment', label: 'Duplicate Payment' },
                  { value: 'partial_refund_not_reflected', label: 'Unadjusted Refund' },
                ]}
              />"""

c = c.replace(category_select, custom_category)

# Replace Sort Select
sort_select = """<select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-paper-0 border border-rule-300 rounded-md px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-ink-900 transition-colors appearance-none"
              >
                <option value="discrepancy">High Risk First</option>
                <option value="amount">Amount (High to Low)</option>
                <option value="age">Age (Oldest First)</option>
              </select>"""

custom_sort = """<CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                options={[
                  { value: 'discrepancy', label: 'High Risk First' },
                  { value: 'amount', label: 'Amount (High to Low)' },
                  { value: 'age', label: 'Age (Oldest First)' },
                ]}
              />"""

c = c.replace(sort_select, custom_sort)

with open(path, 'w') as f:
    f.write(c)
