import { Link } from 'react-router-dom';
import { SequentialTraceLine } from '../../components/ui/SequentialTraceLine';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Money enters across four counterparty streams',
      role: 'Four Financial Feeds',
      desc: 'Every customer transaction creates multiple independent records: the payment captured in the checkout register, the net payout reported by the payment gateway, customer refund adjustments, and the final deposit line on the institutional bank statement.',
      subtext: 'Four source counterparties: payment_id, settlement_id, refund_id, and bank UTR reference.',
    },
    {
      step: '02',
      title: 'Records are compared against contractual fee rules',
      role: 'Paisa-Level Verification',
      desc: 'The reconciliation engine applies exact commercial contract terms down to ₹0.01: Expected Net = Gross captured − [Agreed MDR fee (2%) + Statutory GST (18%)] − Customer refunds. When all four counterparties agree down to the single paisa, the transaction is verified and closed.',
      subtext: 'Automatic match: zero variance (≤ ₹0.01) and confirmed bank deposit.',
    },
    {
      step: '03',
      title: 'A discrepancy is isolated and redlined at the exact source',
      role: 'Variance Isolation',
      desc: 'If less money arrives than contracted—or a bank credit never appears, or a gateway deduction deviates from the agreed fee schedule—the broken relationship is redlined immediately. The deficit is isolated into an exception case categorized under one of eight strict financial failure modes.',
      subtext: 'Surfaced into operational review queue prioritized by monetary exposure.',
    },
    {
      step: '04',
      title: 'Evidence and governing operating rules are reviewed side by side',
      role: 'Finance Operator + Policy Notes',
      desc: 'A finance controller opens the case dossier. The four original counterparty slips are presented as physical audit documents alongside the exact contractual clause from the approved operating manual, clarifying why the variance occurred without guesswork.',
      subtext: 'Read-only guidance citing exact SOP section and line numbers.',
    },
    {
      step: '05',
      title: 'A human decision is permanently recorded to the ledger',
      role: 'Finance Controller Sign-Off',
      desc: 'The controller determines the commercial resolution: approve with an authorized fee waiver, initiate a clawback dispute with the gateway, or escalate to banking operations. Their identity, rationale, and timestamp are sealed into an immutable, append-only audit ledger.',
      subtext: 'Permanent audit receipt: dated, cryptographically verifiable, and non-repudiable.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16 font-sans">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
          OPERATIONAL METHODOLOGY
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-ink leading-tight">
          How continuous reconciliation closes the loop
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary font-normal leading-relaxed">
          LedgerLens separates mathematical fact calculation from human policy judgment. Software verifies deterministic parity; human controllers resolve financial ambiguity.
        </p>
      </div>

      {/* Sequential Journey */}
      <div className="space-y-4">
        {steps.map((s, idx) => (
          <div key={s.step} className="flex items-stretch">
            <SequentialTraceLine isLast={idx === steps.length - 1} active={true} />
            <div className="flex-1 border border-rule bg-surface p-6 sm:p-8 rounded-xs space-y-4 shadow-subtle relative mb-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-rule/60 pb-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs font-semibold text-ink-secondary">
                    STAGE {s.step}
                  </span>
                  <h3 className="font-editorial text-2xl font-medium text-ink">
                    {s.title}
                  </h3>
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-xs border ${
                  s.role.includes('Human')
                    ? 'border-brass text-brass bg-brass/5 font-semibold'
                    : 'border-rule text-ink-secondary bg-canvas font-medium'
                }`}>
                  Actor: {s.role}
                </span>
              </div>

              <p className="text-sm text-ink leading-relaxed max-w-3xl">
                {s.desc}
              </p>

              <div className="text-xs font-mono text-ink-secondary pt-2 border-t border-rule/40">
                {s.subtext}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Callout */}
      <div className="border border-rule bg-surface-evidence p-8 rounded-xs text-center space-y-4">
        <h3 className="font-editorial text-2xl font-medium text-ink">
          Inspect the live reconciliation engine
        </h3>
        <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto leading-relaxed">
          See how real synthetic batches are processed and how redlines are reviewed in the operational queue.
        </p>
        <div className="pt-2">
          <Link
            to="/app/queue"
            className="px-6 py-2.5 bg-ink text-canvas hover:bg-ink/90 text-sm font-medium rounded-xs transition-colors inline-block"
          >
            Open review queue
          </Link>
        </div>
      </div>
    </div>
  );
}
