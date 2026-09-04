import { Link } from 'react-router-dom';

export default function DocsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16 font-sans">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
          DEVELOPER &amp; OPERATOR DOCUMENTATION
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-ink leading-tight">
          System documentation &amp; contracts
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary font-normal leading-relaxed">
          Technical specifications, data contracts, mathematical invariants, and operating principles for the LedgerLens reconciliation platform.
        </p>
      </div>

      {/* Grid of Actionable Documentation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Invariants */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle">
          <span className="text-xs font-mono uppercase text-ink-secondary block">Specification 01</span>
          <h3 className="font-editorial text-2xl font-medium text-ink">
            Financial &amp; Math Invariants
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            All monetary math uses Python <code className="text-ink font-mono">Decimal</code> and PostgreSQL <code className="text-ink font-mono">numeric(18,2)</code>. Floating-point types are strictly forbidden across the pipeline.
          </p>
          <div className="p-3 bg-canvas border border-rule rounded-xs font-mono text-[11px] text-ink space-y-1">
            <div>Expected Net = Gross - [Fee (2%) + GST (18%)] - Refunds</div>
            <div className="text-ink-secondary">&Delta; Tolerable variance &le; ₹0.01</div>
          </div>
        </div>

        {/* Section 2: Four-Source Architecture */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle">
          <span className="text-xs font-mono uppercase text-ink-secondary block">Specification 02</span>
          <h3 className="font-editorial text-2xl font-medium text-ink">
            Four-Source Evidence Contracts
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Every transaction is evaluated across four distinct counterparty streams before auto-resolution or exception routing.
          </p>
          <ul className="text-xs font-mono text-ink-secondary space-y-1.5 list-disc pl-4">
            <li><strong className="text-ink">Payments:</strong> captured merchant order references</li>
            <li><strong className="text-ink">Settlements:</strong> reported net payout line items</li>
            <li><strong className="text-ink">Refunds:</strong> customer returns and reversals</li>
            <li><strong className="text-ink">Bank Credits:</strong> verified institutional statement UTRs</li>
          </ul>
        </div>

        {/* Section 3: Idempotent Ingestion */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle">
          <span className="text-xs font-mono uppercase text-ink-secondary block">Specification 03</span>
          <h3 className="font-editorial text-2xl font-medium text-ink">
            ACID Ingestion &amp; Idempotency
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Upload endpoints support optional <code className="text-ink font-mono">X-Idempotency-Key</code> headers. Replaying an identical batch returns the original receipt without duplicating records.
          </p>
          <div className="p-3 bg-canvas border border-rule rounded-xs font-mono text-[11px] text-ink space-y-1">
            <div>POST /api/v1/ingestion/upload/:source_type</div>
            <div className="text-ink-secondary">Enforces atomic multi-row commits &amp; hash deduplication</div>
          </div>
        </div>

        {/* Section 4: Audit Trail Permanence */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle">
          <span className="text-xs font-mono uppercase text-ink-secondary block">Specification 04</span>
          <h3 className="font-editorial text-2xl font-medium text-ink">
            Audit Trail &amp; Safe Concurrency
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Operator actions enforce optimistic concurrency (version checks). Colliding reviews return HTTP 409 to prevent accidental overwrites. All changes write to an append-only event ledger.
          </p>
          <div className="p-3 bg-canvas border border-rule rounded-xs font-mono text-[11px] text-ink space-y-1">
            <div>Signer &bull; Action &bull; Version &bull; Timestamp &bull; Rationale</div>
            <div className="text-ink-secondary">Shared persisted event store between case &amp; global views</div>
          </div>
        </div>
      </div>

      {/* Living Ledger Design Tokens Reference */}
      <div className="border border-rule bg-surface p-8 rounded-xs space-y-6 shadow-subtle">
        <div className="border-b border-rule pb-3">
          <span className="text-xs font-mono uppercase text-ink-secondary block">DESIGN SYSTEM SPECIFICATION</span>
          <h3 className="font-editorial text-2xl font-medium text-ink mt-0.5">
            The Living Ledger Design Tokens
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="text-ink-secondary text-[10px] block">CANVAS</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-rule" style={{ backgroundColor: '#F4F1EA' }} />
              <span className="font-semibold text-ink">#F4F1EA</span>
            </div>
            <span className="text-[10px] text-ink-muted">Mineral paper</span>
          </div>

          <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="text-ink-secondary text-[10px] block">PRIMARY INK</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1C1B19' }} />
              <span className="font-semibold text-ink">#1C1B19</span>
            </div>
            <span className="text-[10px] text-ink-muted">Warm charcoal</span>
          </div>

          <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="text-ink-secondary text-[10px] block">LEDGER GREEN</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3D6B55' }} />
              <span className="font-semibold text-ink">#3D6B55</span>
            </div>
            <span className="text-[10px] text-ink-muted">Verified match</span>
          </div>

          <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="text-ink-secondary text-[10px] block">OXIDE RED</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#B94E3D' }} />
              <span className="font-semibold text-ink">#B94E3D</span>
            </div>
            <span className="text-[10px] text-ink-muted">Discrepancy redline</span>
          </div>
        </div>

        <div className="pt-2 text-xs font-sans text-ink-secondary flex justify-between items-center border-t border-rule/60">
          <span>Typography: Newsreader (Headings), Instrument Sans (UI &amp; Body), IBM Plex Mono (Amounts &amp; IDs)</span>
          <Link to="/app/queue" className="text-link hover:underline font-mono text-[11px]">Open review queue &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
