import { Link } from 'react-router-dom';
import { LedgerTraceA } from '../../components/concepts/LedgerTraceA';
import { ArrowRight, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full font-sans text-ink bg-canvas selection:bg-surface-evidence selection:text-ink">
      {/* 1. Hero on Deep Ink Canvas */}
      <section className="relative bg-[#111315] text-[#FCFBF8] overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-white/10">
        {/* Ambient Radial Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none opacity-25"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(234, 228, 216, 0.4), transparent 70%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 space-y-12 relative z-10">
          {/* Masthead Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 text-xs font-mono text-[#D8D2C8]">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ledger-green" />
              <span className="tracking-wider uppercase text-[#EAE4D8]">
                Financial Operations Control Room
              </span>
              <span className="text-[#716E68]">&bull;</span>
              <span className="text-[#A87931]">Synthetic Demo Environment</span>
            </div>

            <Link
              to="/how-it-works"
              className="text-xs font-mono text-[#D8D2C8] hover:text-white underline decoration-white/30 transition-colors"
            >
              How it works [7 simple steps] &rarr;
            </Link>
          </div>

          {/* Hero Typography & Core Promise */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A87931] block">
                Financial operations
              </span>
              <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#FCFBF8] leading-[1.08]">
                When four financial records do not agree, <br />
                <span className="italic text-[#EAE4D8]">LedgerLens</span> shows where the difference started.
              </h1>
              <p className="text-base sm:text-lg text-[#D8D2C8] leading-relaxed max-w-2xl font-light">
                LedgerLens compares payments, provider payouts, refunds, and bank credits. If they do not agree, it shows the difference and the approved rule so a reviewer can decide what happens next.
              </p>
            </div>

            <div className="lg:col-span-4 space-y-3.5 lg:pb-2">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  to="/how-it-works"
                  className="px-6 py-3.5 bg-[#FCFBF8] text-[#111315] font-medium text-xs rounded-xs hover:bg-[#EAE4D8] transition-colors text-center shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <span>See how it works</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3 border border-white/20 hover:border-white/40 text-[#D8D2C8] hover:text-white text-xs rounded-xs transition-colors text-center font-mono"
                >
                  Review a case &rarr;
                </Link>
              </div>
              <div className="text-[11px] font-mono text-[#A8A49C] text-center lg:text-left">
                Demo data only &bull; A human reviewer makes the final decision
              </div>
            </div>
          </div>

          {/* Visual Proof Element: Four Records Converging */}
          <div className="space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs font-mono text-[#A8A49C] gap-1">
              <span>FOUR RECORDS ARRIVE &mdash; EXACT DIFFERENCE HIGHLIGHTED</span>
              <span className="text-[#B94E3D] font-medium">DIFFERENCE FOUND IN PROVIDER PAYOUT</span>
            </div>
            <LedgerTraceA hasDiscrepancy={true} />
          </div>
        </div>
      </section>

      {/* 2. Concrete Example: Clean Transaction vs Broken Transaction */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
            A CONCRETE COMPARISON
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
            What matching looks like vs. where money is missing
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            See the difference between records that agree and clear automatically, and a case where ₹150 is missing and needs a human decision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Clean Transaction Card */}
          <div className="border border-rule bg-surface p-6 sm:p-8 rounded-xs space-y-5 shadow-subtle flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="text-xs font-mono text-ink-secondary uppercase tracking-wider">
                  EXAMPLE 1 &bull; MATCHED
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-ledger-green/10 text-ledger-green text-xs font-mono font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All four amounts agree
                </span>
              </div>

              <h3 className="font-editorial text-2xl font-medium text-ink">
                Clean ₹10,000 transaction
              </h3>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-canvas border border-rule rounded-xs">
                  <span className="text-ink-secondary">1. Payment (what customer paid):</span>
                  <span className="font-semibold text-ink">₹10,000.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-canvas border border-rule rounded-xs">
                  <span className="text-ink-secondary">2. Provider payout (what provider sent):</span>
                  <span className="font-semibold text-ink">₹9,764.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-canvas border border-rule rounded-xs">
                  <span className="text-ink-secondary">3. Refund (money returned):</span>
                  <span className="font-semibold text-ink">₹0.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-ledger-green/10 border border-ledger-green/30 rounded-xs text-ledger-green font-medium">
                  <span>4. Bank credit (money received):</span>
                  <span className="font-semibold">₹9,764.00</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-canvas border border-rule rounded-xs text-xs font-sans text-ink-secondary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-ledger-green shrink-0" />
              <span>All four amounts agree. The case can close automatically.</span>
            </div>
          </div>

          {/* Broken Transaction Card */}
          <div className="border border-critical/30 bg-surface p-6 sm:p-8 rounded-xs space-y-5 shadow-subtle flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="text-xs font-mono text-critical uppercase tracking-wider">
                  EXAMPLE 2 &bull; DIFFERENCE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-critical/10 text-critical text-xs font-mono font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Sent to human reviewer
                </span>
              </div>

              <h3 className="font-editorial text-2xl font-medium text-ink">
                ₹150 is missing: case needs attention
              </h3>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-canvas border border-rule rounded-xs">
                  <span className="text-ink-secondary">1. Payment (what customer paid):</span>
                  <span className="font-semibold text-ink">₹10,000.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-critical/5 border border-critical/30 rounded-xs text-critical">
                  <span>2. Provider payout (shortfall):</span>
                  <span className="font-semibold">₹9,614.00 (Expected ₹9,764.00)</span>
                </div>
                <div className="flex justify-between p-2.5 bg-canvas border border-rule rounded-xs">
                  <span className="text-ink-secondary">3. Refund (money returned):</span>
                  <span className="text-ink-secondary">₹0.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-canvas border border-rule rounded-xs">
                  <span className="text-ink-secondary">4. Bank credit (money received):</span>
                  <span className="font-semibold text-ink">₹9,614.00</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-critical/10 border border-critical/30 rounded-xs text-xs font-sans text-critical flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>₹150 is missing.</strong> The case goes to a human reviewer to decide what happens next.</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/evidence"
            className="inline-flex items-center gap-2 text-xs font-mono text-ink-secondary hover:text-ink underline decoration-rule hover:decoration-ink transition-colors"
          >
            <span>Read full evidence comparison walkthrough</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. The 4-Step Story Summary */}
      <section className="bg-surface border-y border-rule py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
              THE WORKFLOW
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
              One clear story from difference to decision
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Four financial records arrive. LedgerLens compares them. If they do not agree, it shows where the difference is. An approved rule explains what to check. A human reviewer decides what happens next. The decision is saved.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-rule bg-canvas p-5 rounded-xs space-y-3 shadow-subtle">
              <div className="w-8 h-8 rounded-xs bg-surface border border-rule flex items-center justify-center font-mono text-xs font-semibold text-ink">
                01
              </div>
              <h3 className="font-editorial text-xl font-medium text-ink">
                Bring in the records
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Payments, provider payouts, customer refunds, and bank credits arrive from source files.
              </p>
            </div>

            <div className="border border-rule bg-canvas p-5 rounded-xs space-y-3 shadow-subtle">
              <div className="w-8 h-8 rounded-xs bg-surface border border-rule flex items-center justify-center font-mono text-xs font-semibold text-ink">
                02
              </div>
              <h3 className="font-editorial text-xl font-medium text-ink">
                Find the difference
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                LedgerLens checks the four records down to the nearest paisa. Any difference is shown clearly.
              </p>
            </div>

            <div className="border border-rule bg-canvas p-5 rounded-xs space-y-3 shadow-subtle">
              <div className="w-8 h-8 rounded-xs bg-surface border border-rule flex items-center justify-center font-mono text-xs font-semibold text-ink">
                03
              </div>
              <h3 className="font-editorial text-xl font-medium text-ink">
                Read the approved rule
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Approved rules explain why a case needs attention and what a reviewer should check next.
              </p>
            </div>

            <div className="border border-rule bg-canvas p-5 rounded-xs space-y-3 shadow-subtle">
              <div className="w-8 h-8 rounded-xs bg-surface border border-rule flex items-center justify-center font-mono text-xs font-semibold text-ink">
                04
              </div>
              <h3 className="font-editorial text-xl font-medium text-ink">
                Make a human decision
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                A human reviewer makes the final decision. The decision is saved to history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Human Control Statement & Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center space-y-8">
        <div className="border border-rule bg-surface p-8 sm:p-12 rounded-xs space-y-6 shadow-subtle">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-canvas border border-rule rounded-xs text-[11px] font-mono text-ink-secondary">
            <UserCheck className="w-3.5 h-3.5 text-resolved" />
            <span className="uppercase tracking-wider">Human accountability statement</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-ink leading-snug">
            The software checks the numbers. <br className="hidden sm:inline" />
            A person decides what to do.
          </h2>

          <p className="text-sm text-ink-secondary max-w-xl mx-auto leading-relaxed">
            AI can explain evidence and approved policy, but it never makes the final financial decision or moves money. Every decision requires a human reviewer and is saved to review history.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-ink text-canvas hover:bg-ink/90 text-xs font-medium rounded-xs transition-colors shadow-subtle inline-flex items-center gap-2"
            >
              <span>Review a case</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 py-3.5 border border-rule bg-canvas hover:bg-surface text-ink text-xs font-mono rounded-xs transition-colors"
            >
              See how it works [7 steps]
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

