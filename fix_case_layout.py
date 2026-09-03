with open("frontend/src/pages/app/CasePage.tsx", "r") as f:
    c = f.read()

# Replace the 3-column layout with 2-column
c = c.replace(
    "{/* 3-Column Persistent Desktop Workspace */}",
    "{/* 2-Column Desktop Workspace (Direction A) */}"
)

old_columns = """      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* COLUMN 1: Case Context & Audit Timeline (w-full lg:w-[22%]) */}
        <div className="w-full lg:w-[22%] space-y-4 shrink-0">
          <div className="control-panel rounded-xl p-4 space-y-3 shadow-none">
            <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider font-sans border-b border-rule-300 pb-2">
              Case Metadata
            </h3>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="text-ink-700 block text-[11px] font-sans">Amount at Risk</span>
                <AmountDisplay
                  amount={evidence.payment?.amount || evidence.expected_net_settlement}
                  className="text-lg font-bold text-ink-900 font-mono"
                />
              </div>

              <div>
                <span className="text-ink-700 block text-[11px] font-sans">Calculated Discrepancy</span>
                <AmountDisplay
                  amount={evidence.settlement_discrepancy}
                  isDiscrepancy={true}
                  className="text-base font-bold font-mono text-ledger-vermilion"
                />
              </div>

              <div className="pt-2 border-t border-rule-300 space-y-2 text-xs">
                <div className="flex justify-between items-center text-ink-700">
                  <span>Exception Code</span>
                  <span className="text-ink-900 font-mono text-xs font-medium">{evidence.exception_type}</span>
                </div>
                <div className="flex justify-between items-center text-ink-700">
                  <span>Decision State</span>
                  <span className="text-ink-900 font-mono text-xs font-medium">{evidence.decision_status}</span>
                </div>
                <div className="flex justify-between items-center text-ink-700">
                  <span>Lock Version</span>
                  <span className="text-ink-900 font-mono text-xs font-medium">v{evidence.version}</span>
                </div>
              </div>
            </div>
          </div>

          <AuditTimeline events={auditEvents} />
        </div>

        {/* COLUMN 2: Evidence Comparison Grid & Policy AI Drawer (w-full lg:w-[48%]) */}
        <div className="w-full lg:w-[48%] space-y-4 flex-1">
          <MultiSourceCard evidence={evidence} />
          <RagCopilotPanel caseId={evidence.case_id} autoRun={true} />
        </div>

        {/* COLUMN 3: Sticky Human Decision Panel (w-full lg:w-[30%]) */}
        <div className="w-full lg:w-[30%] lg:sticky lg:top-14 space-y-4 shrink-0">
          <ReviewActionForm
            evidence={evidence}
            onSuccess={handleReviewSuccess}
            onRefreshCase={loadCaseData}
          />
        </div>
      </div>"""

new_columns = """      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Left Column: Evidence Comparison Grid (Direction A) */}
        <div className="space-y-6">
          <MultiSourceCard evidence={evidence} />
        </div>

        {/* Right Column: AI Advisory & Human Decision Log (Direction A) */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <RagCopilotPanel caseId={evidence.case_id} autoRun={true} />
          
          <ReviewActionForm
            evidence={evidence}
            onSuccess={handleReviewSuccess}
            onRefreshCase={loadCaseData}
          />
          
          <AuditTimeline events={auditEvents} />
        </div>
      </div>"""

if old_columns in c:
    c = c.replace(old_columns, new_columns)
else:
    print("Could not find old columns string, attempting regex replacement.")
    import re
    c = re.sub(r'<div className="flex flex-col lg:flex-row gap-5 items-start">.*?</ReviewActionForm>\n        </div>\n      </div>', new_columns, c, flags=re.DOTALL)

with open("frontend/src/pages/app/CasePage.tsx", "w") as f:
    f.write(c)
