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
            The Fundamental Tenet: Software calculates, humans decide.
          </h3>
          <p className="text-ink-secondary leading-relaxed">
            In modern financial engineering, there is a dangerous temptation to surrender ledger arithmetic to non-deterministic artificial intelligence. We reject this premise entirely. Large language models should never perform final accounting math. They are probabilistic reasoning layers, not calculators.
          </p>
          <p className="text-ink-secondary leading-relaxed">
            LedgerLens is designed on a bedrock separation of concerns:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono text-xs">
            <div className="p-4 bg-canvas border border-rule rounded-xs space-y-1">
              <strong className="text-ink block font-sans text-sm">Deterministic Machine Core</strong>
              <p className="text-ink-secondary text-[11px] leading-normal font-mono">
                Pure PostgreSQL and Python Decimal logic evaluates four-source counterparty parity down to the exact paisa. Zero room for hallucination.
              </p>
            </div>
            <div className="p-4 bg-canvas border border-rule rounded-xs space-y-1">
              <strong className="text-ink block font-sans text-sm">Human Governance Layer</strong>
              <p className="text-ink-secondary text-[11px] leading-normal font-mono">
                When contractual invariants break, grounded policy guidance explains the commercial context—empowering an accountable human operator to record the final sign-off.
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
                <strong className="text-ink">No Black Boxes:</strong> Every discrepancy surfaced by the engine cites the exact records, timestamps, and line numbers that triggered the exception.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-ledger-green font-semibold">02</span>
              <span>
                <strong className="text-ink">Immutable Audit Trail:</strong> No financial decision is final until it is recorded with the signer’s identity, timestamp, and version hash in an append-only ledger.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-ledger-green font-semibold">03</span>
              <span>
                <strong className="text-ink">Strict Float-Free Mathematics:</strong> Every amount is stored and calculated as an exact fixed-point decimal to protect against floating-point rounding bleed.
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
