import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16 font-sans">
      {/* Editorial Masthead */}
      <div className="space-y-4">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
          ORIGIN &amp; PHILOSOPHY
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-ink leading-tight">
          Why LedgerLens exists
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary font-normal leading-relaxed">
          Financial reconciliation is the quiet cornerstone of commerce. When it breaks, companies bleed revenue, misreport taxes, and burn hundreds of operator hours tracking down ghost discrepancies.
        </p>
      </div>

      {/* Narrative Body */}
      <div className="space-y-8 text-sm text-ink leading-relaxed">
        <div className="border border-rule bg-surface p-8 rounded-xs space-y-4 shadow-subtle">
          <h3 className="font-editorial text-2xl font-medium text-ink">
            The software checks the numbers. A person decides what to do.
          </h3>
          <p className="text-ink-secondary leading-relaxed font-sans">
            In modern financial software, there is a dangerous temptation to let artificial intelligence make financial decisions. We reject this premise entirely. AI can summarize evidence and approved rules, but cannot approve money, close a case, or replace the reviewer. AI can explain patterns, but it cannot be the final calculator.
          </p>
          <p className="text-ink-secondary leading-relaxed font-sans">
            LedgerLens is built around a clear division of work:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-4 bg-canvas border border-rule rounded-xs space-y-1">
              <strong className="text-ink block font-sans text-sm">Rules for the math</strong>
              <p className="text-ink-secondary text-[11px] leading-relaxed font-sans">
                Exact math checks four records—payments, provider payouts, refunds, and bank credits—down to the nearest paisa. Math rules never guess.
              </p>
            </div>
            <div className="p-4 bg-canvas border border-rule rounded-xs space-y-1">
              <strong className="text-ink block font-sans text-sm">Human decisions for action</strong>
              <p className="text-ink-secondary text-[11px] leading-relaxed font-sans">
                When records do not agree, approved rules explain what to check. An accountable human reviewer decides what happens next, and the decision is saved.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-rule bg-surface p-8 rounded-xs space-y-4 shadow-subtle">
          <h3 className="font-editorial text-2xl font-medium text-ink">
            Our Commitments to Financial Truth
          </h3>
          <ul className="space-y-3 font-sans text-xs text-ink-secondary">
            <li className="flex items-start gap-3">
              <span className="font-mono text-ledger-green font-semibold">01</span>
              <span>
                <strong className="text-ink">Clear evidence:</strong> Every difference surfaced cites the exact four source records and reference numbers so nothing is hidden.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-ledger-green font-semibold">02</span>
              <span>
                <strong className="text-ink">Saved review history:</strong> Saved history that cannot be silently changed. Every decision records who decided, when, why, and the exact version of the case.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-ledger-green font-semibold">03</span>
              <span>
                <strong className="text-ink">Checked to the nearest paisa:</strong> Every amount is calculated using exact decimal arithmetic so rounding errors never become missing money.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Close */}
      <div className="pt-4 border-t border-rule flex justify-between items-center text-xs">
        <span className="font-mono text-ink-secondary">Built for high-volume financial operations</span>
        <Link to="/app/queue" className="px-5 py-2.5 bg-ink text-canvas font-medium rounded-xs hover:bg-ink/90 transition-colors">
          Open review queue &rarr;
        </Link>
      </div>
    </div>
  );
}
