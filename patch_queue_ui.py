import re

path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Replace the header and controls area to look much cleaner
old_header = """<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold font-display tracking-tight text-ink-900">
              Exception Triage
            </h1>
            <p className="text-sm text-ink-700 mt-1 font-sans">
              {processedCases.length} anomalies requiring manual human resolution
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-ink-700 font-sans uppercase tracking-wider mb-1">Total Amount at Risk</span>
            <span className="text-2xl font-mono font-bold text-ledger-vermilion">₹{totalAmountAtRisk}</span>
          </div>
        </div>"""
new_header = """<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-rule-300">
          <div>
            <h1 className="text-3xl font-semibold font-display tracking-tight text-ink-900">
              Exception Triage
            </h1>
            <p className="text-sm text-ink-700 mt-2 font-sans max-w-xl leading-relaxed">
              {processedCases.length} outstanding reconciliation anomalies requiring manual human review. Select a case below to inspect source evidence and enforce ledger policy.
            </p>
          </div>
          <div className="flex flex-col items-end bg-paper-1 px-5 py-4 border border-rule-300 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono text-ink-700 uppercase tracking-widest mb-1.5">Total Amount at Risk</span>
            <span className="text-2xl font-mono font-medium text-ledger-vermilion">₹{totalAmountAtRisk}</span>
          </div>
        </div>"""
content = content.replace(old_header, new_header)

# Improve filter section padding
content = content.replace('<div className="flex flex-col sm:flex-row gap-4 mb-4">', '<div className="flex flex-col sm:flex-row gap-4 py-4">')

# Table structural fixes
old_table = """<div className="control-panel rounded-xl overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Exception review queue">
              <thead>
                <tr className="bg-paper-1 border-b border-rule-300 text-[11px] font-semibold text-ink-700 font-sans uppercase tracking-wider">
                  <th scope="col" className="py-3 px-5 w-28">Severity</th>
                  <th scope="col" className="py-3 px-5">What Happened &amp; Identifiers</th>
                  <th scope="col" className="py-3 px-5 text-right w-40">At Risk</th>
                  <th scope="col" className="py-3 px-5 text-right w-28">Action</th>
                </tr>
              </thead>"""
new_table = """<div className="bg-paper-0 border border-rule-300 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Exception review queue">
              <thead>
                <tr className="bg-paper-1 border-b border-rule-300">
                  <th scope="col" className="py-3 px-6 w-32 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Severity</th>
                  <th scope="col" className="py-3 px-6 text-[10px] font-mono text-ink-700 uppercase tracking-widest">What Happened &amp; Identifiers</th>
                  <th scope="col" className="py-3 px-6 text-right w-48 text-[10px] font-mono text-ink-700 uppercase tracking-widest">At Risk</th>
                  <th scope="col" className="py-3 px-6 text-right w-32 text-[10px] font-mono text-ink-700 uppercase tracking-widest">Action</th>
                </tr>
              </thead>"""
content = content.replace(old_table, new_table)

# Fix td padding in the tr
content = content.replace('className="py-4 px-5 align-top"', 'className="py-5 px-6 align-top"')

with open(path, 'w') as f:
    f.write(content)
