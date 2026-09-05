import { Link } from 'react-router-dom';
import { SequentialTraceLine } from '../../components/ui/SequentialTraceLine';
import { ArrowRight, Layers, CheckCircle2, AlertTriangle, FileSearch, BookOpen, UserCheck, ShieldCheck } from 'lucide-react';

export default function HowItWorksPage() {
  const stages = [
    {
      number: '01',
      title: 'Bring the records together',
      summary: 'Every customer purchase creates four separate records: checkout payment, payment gateway payout, customer refund, and bank deposit.',
      detail: 'LedgerLens gathers all four records in one place so nothing is hidden or assumed.',
      icon: Layers,
      indicator: 'Record Intake',
      visualBadge: 'Four Financial Records',
    },
    {
      number: '02',
      title: 'Check whether they agree',
      summary: 'LedgerLens calculates the exact expected payout by subtracting agreed gateway fees and taxes down to the single paisa.',
      detail: 'When what was captured matches what reached the bank, the transaction is verified and marked complete.',
      icon: CheckCircle2,
      indicator: 'Automatic Verification',
      visualBadge: 'Exact Math',
    },
    {
      number: '03',
      title: 'Find what does not match',
      summary: 'If a bank credit is short, a fee is higher than agreed, or a refund is missing, LedgerLens flags the exact difference immediately.',
      detail: 'The transaction is paused and sent to the review queue before discrepancies can compound.',
      icon: AlertTriangle,
      indicator: 'Discrepancy Flagged',
      visualBadge: 'Variance Isolated',
    },
    {
      number: '04',
      title: 'Compare the evidence',
      summary: 'A human reviewer opens the case dossier to see the four original source records side by side.',
      detail: 'Every number, identifier, and bank reference is displayed clearly so you can see exactly where the money stopped matching.',
      icon: FileSearch,
      indicator: 'Evidence Review',
      visualBadge: 'Side-by-Side Proof',
    },
    {
      number: '05',
      title: 'Read the approved rule',
      summary: 'LedgerLens displays the exact company policy or gateway operating standard that applies to this specific situation.',
      detail: 'Advisory guidance shows previous precedent and standard resolution steps without guessing.',
      icon: BookOpen,
      indicator: 'Company Policy',
      visualBadge: 'Approved Guidance',
    },
    {
      number: '06',
      title: 'A human chooses what happens next',
      summary: 'The software never moves money or closes cases on its own. An authorized person reviews the evidence and records a decision.',
      detail: 'The reviewer can approve a valid fee adjustment, request a missing bank credit, or dispute an overcharge.',
      icon: UserCheck,
      indicator: 'Human Authority',
      visualBadge: 'Reviewer Decision',
    },
    {
      number: '07',
      title: 'Save the result in the record',
      summary: 'The reviewer’s choice, written reason, and exact timestamp are permanently saved to the ledger.',
      detail: 'This creates a tamper-evident audit receipt that cannot be altered or silently deleted.',
      icon: ShieldCheck,
      indicator: 'Permanent Receipt',
      visualBadge: 'Audit Trail',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16 font-sans selection:bg-surface-evidence selection:text-ink">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
          FINANCIAL INVESTIGATION WORKFLOW
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-ink leading-tight">
          How LedgerLens works in seven simple steps
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary font-normal leading-relaxed">
          LedgerLens brings four financial records together, highlights the break, shows the approved rule, and lets a human decide.
        </p>
      </div>

      {/* 7 Story Stages */}
      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const IconComponent = stage.icon;
          const isLast = idx === stages.length - 1;
          return (
            <div key={stage.number} className="flex items-stretch">
              <SequentialTraceLine isLast={isLast} active={true} />
              <div className="flex-1 border border-rule bg-surface p-6 sm:p-8 rounded-xs space-y-4 shadow-subtle relative mb-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-rule/60 pb-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-semibold text-ink-secondary">
                      STEP {stage.number}
                    </span>
                    <h2 className="font-editorial text-2xl font-medium text-ink">
                      {stage.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs border border-rule text-ink-secondary bg-canvas">
                      {stage.indicator}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink leading-relaxed">
                    {stage.summary}
                  </p>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {stage.detail}
                  </p>
                </div>

                <div className="pt-2 border-t border-rule/40 flex items-center justify-between text-xs font-mono text-ink-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <IconComponent className="w-3.5 h-3.5 text-ink-secondary" />
                    <span>{stage.visualBadge}</span>
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    Stage {stage.number} of 07
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Step Callout */}
      <div className="border border-rule bg-surface-evidence p-8 rounded-xs text-center space-y-4 shadow-subtle">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block">
          NEXT STEP IN THE JOURNEY
        </span>
        <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-ink">
          See the evidence in action
        </h3>
        <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto leading-relaxed">
          Compare a clean transaction that matched perfectly against a broken transaction where money stopped matching.
        </p>
        <div className="pt-2">
          <Link
            to="/evidence"
            className="px-6 py-2.5 bg-ink text-canvas hover:bg-ink/90 text-xs font-medium rounded-xs transition-colors inline-flex items-center gap-2 shadow-subtle"
          >
            <span>See the evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

