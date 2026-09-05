import { Link } from 'react-router-dom';
import { SequentialTraceLine } from '../../components/ui/SequentialTraceLine';
import { ArrowRight, Layers, CheckCircle2, AlertTriangle, FileSearch, BookOpen, UserCheck, ShieldCheck } from 'lucide-react';

export default function HowItWorksPage() {
  const stages = [
    {
      number: '01',
      title: 'Bring in the records',
      summary: 'Every transaction creates four separate records: checkout payment, provider payout, refund, and bank credit.',
      detail: 'LedgerLens brings all four records into one view so finance teams do not have to copy and paste between files.',
      icon: Layers,
      indicator: 'Records received',
      visualBadge: 'Four financial records',
    },
    {
      number: '02',
      title: 'Check the amounts',
      summary: 'LedgerLens calculates the expected provider payout by subtracting the agreed fee and tax down to the nearest paisa.',
      detail: 'When the payment minus fees equals the bank deposit, the case matches and can close without manual review.',
      icon: CheckCircle2,
      indicator: 'Exact calculation',
      visualBadge: 'Checked to the nearest paisa',
    },
    {
      number: '03',
      title: 'Find the difference',
      summary: 'If a bank credit is short, a fee is higher than agreed, or a refund is missing, LedgerLens highlights the exact difference.',
      detail: 'The case pauses and goes into the review queue so errors do not compound.',
      icon: AlertTriangle,
      indicator: 'Needs attention',
      visualBadge: 'Difference highlighted',
    },
    {
      number: '04',
      title: 'Compare the evidence',
      summary: 'A reviewer opens the case to see all four source records side by side with their original reference numbers.',
      detail: 'You can see exactly what the customer paid, what the provider sent, any refunds, and what arrived in the bank.',
      icon: FileSearch,
      indicator: 'Evidence side by side',
      visualBadge: 'Four sources compared',
    },
    {
      number: '05',
      title: 'Read the approved rule',
      summary: 'LedgerLens shows the approved policy that explains the difference and what steps to check next.',
      detail: 'Reviewers get clear guidance based on company policy rather than guessing what to do.',
      icon: BookOpen,
      indicator: 'Approved rule',
      visualBadge: 'Policy guidance',
    },
    {
      number: '06',
      title: 'Make a human decision',
      summary: 'The software never moves money or approves exceptions on its own. A person decides what should happen next.',
      detail: 'The reviewer can approve a valid adjustment, reject a discrepancy, or escalate for further review.',
      icon: UserCheck,
      indicator: 'Human decision',
      visualBadge: 'Reviewer choice',
    },
    {
      number: '07',
      title: 'Save what happened',
      summary: 'The reviewer’s decision, written explanation, and timestamp are saved permanently into review history.',
      detail: 'This saved history cannot be silently changed or deleted, providing complete traceability for audits.',
      icon: ShieldCheck,
      indicator: 'Saved review history',
      visualBadge: 'Permanent record',
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
          Four financial records arrive. LedgerLens compares them. If they do not agree, it shows where the difference is. An approved rule explains what to check. A human reviewer decides what happens next. The decision is saved.
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
          Compare a case where all four amounts agree against a case where ₹150 is missing and needs a human decision.
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

