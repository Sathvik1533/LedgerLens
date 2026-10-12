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
        {/* Section 1: Math rules */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-editorial text-2xl font-medium text-ink">
              Math rules
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Numbers are checked to the nearest paisa so rounding errors never become missing money. If the expected payout differs from what reached the bank by even ₹0.01, the case pauses for a human reviewer.
            </p>
          </div>
          
          <details className="tech-details-disclosure group pt-3 border-t border-rule/60 space-y-2 text-xs">
            <summary className="text-[10px] uppercase font-mono tracking-wider text-ink-secondary hover:text-ink cursor-pointer font-semibold list-none flex items-center justify-between select-none">
              <span>Technical details</span>
              <span className="text-ink-muted group-open:hidden">+ View details</span>
              <span className="text-ink-muted hidden group-open:inline">&minus; Hide details</span>
            </summary>
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-sans text-ink-secondary leading-relaxed">
                All monetary math uses Python <code className="text-ink font-mono">Decimal</code> and PostgreSQL <code className="text-ink font-mono">numeric(18,2)</code>. Floating-point types are strictly forbidden.
              </p>
              <div className="p-2.5 bg-canvas border border-rule rounded-xs font-mono text-[10px] text-ink space-y-0.5">
                <div>Expected Net = Gross - [Fee (2%) + GST (18%)] - Refunds</div>
                <div className="text-ink-secondary">&Delta; Tolerable difference &le; ₹0.01</div>
              </div>
            </div>
          </details>
        </div>

        {/* Section 2: Four records checked */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-editorial text-2xl font-medium text-ink">
              Four records checked
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Every transaction is verified across four independent records before any case is closed: what the customer paid, what the provider sent, what was refunded, and what arrived in the bank.
            </p>
          </div>
          
          <details className="tech-details-disclosure group pt-3 border-t border-rule/60 space-y-2 text-xs">
            <summary className="text-[10px] uppercase font-mono tracking-wider text-ink-secondary hover:text-ink cursor-pointer font-semibold list-none flex items-center justify-between select-none">
              <span>Technical details</span>
              <span className="text-ink-muted group-open:hidden">+ View details</span>
              <span className="text-ink-muted hidden group-open:inline">&minus; Hide details</span>
            </summary>
            <div className="pt-2 space-y-2">
              <ul className="text-[11px] font-mono text-ink-secondary space-y-1 list-disc pl-4">
                <li><strong className="text-ink">Payments:</strong> captured customer order references</li>
                <li><strong className="text-ink">Provider payouts:</strong> reported net payout line items</li>
                <li><strong className="text-ink">Refunds:</strong> customer returns and reversals</li>
                <li><strong className="text-ink">Bank credits:</strong> verified bank reference numbers (UTR)</li>
              </ul>
            </div>
          </details>
        </div>

        {/* Section 3: Safe upload without duplicates */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-editorial text-2xl font-medium text-ink">
              Safe upload without duplicates
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Uploading a file twice never creates duplicate records. Either all records in a batch save together safely, or none do.
            </p>
          </div>
          
          <details className="tech-details-disclosure group pt-3 border-t border-rule/60 space-y-2 text-xs">
            <summary className="text-[10px] uppercase font-mono tracking-wider text-ink-secondary hover:text-ink cursor-pointer font-semibold list-none flex items-center justify-between select-none">
              <span>Technical details</span>
              <span className="text-ink-muted group-open:hidden">+ View details</span>
              <span className="text-ink-muted hidden group-open:inline">&minus; Hide details</span>
            </summary>
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-sans text-ink-secondary leading-relaxed">
                Upload endpoints support optional <code className="text-ink font-mono">X-Idempotency-Key</code> headers. Replaying an identical batch returns the original receipt without duplicating rows.
              </p>
              <div className="p-2.5 bg-canvas border border-rule rounded-xs font-mono text-[10px] text-ink space-y-0.5">
                <div>POST /api/v1/ingestion/:source_type</div>
                <div className="text-ink-secondary">Enforces atomic multi-row commits and duplicate-file checks</div>
              </div>
            </div>
          </details>
        </div>

        {/* Section 4: Saved review history */}
        <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-editorial text-2xl font-medium text-ink">
              Saved review history
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              See what was decided, by whom, when, and why. Protection against two people changing the same case stops accidental overwrites.
            </p>
          </div>
          
          <details className="tech-details-disclosure group pt-3 border-t border-rule/60 space-y-2 text-xs">
            <summary className="text-[10px] uppercase font-mono tracking-wider text-ink-secondary hover:text-ink cursor-pointer font-semibold list-none flex items-center justify-between select-none">
              <span>Technical details</span>
              <span className="text-ink-muted group-open:hidden">+ View details</span>
              <span className="text-ink-muted hidden group-open:inline">&minus; Hide details</span>
            </summary>
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-sans text-ink-secondary leading-relaxed">
                Operator actions enforce optimistic concurrency (version checks). Colliding reviews return HTTP 409 to prevent accidental overwrites. All changes write to an append-only event ledger.
              </p>
              <div className="p-2.5 bg-canvas border border-rule rounded-xs font-mono text-[10px] text-ink space-y-0.5">
                <div>Signer &bull; Action &bull; Version &bull; Timestamp &bull; Reason</div>
                <div className="text-ink-secondary">Shared persisted event store between case and global views</div>
              </div>
            </div>
          </details>
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
