import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../../components/Logo";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo, isLoading, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = (location.state as any)?.from?.pathname || "/app/queue";

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLocalError("Please enter both email and password.");
      return;
    }
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setLocalError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async (role: "reviewer" | "admin") => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await loginDemo(role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setLocalError(err?.message || "Unable to enter demo session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showCredentials, setShowCredentials] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between font-sans selection:bg-surface-evidence selection:text-ink">
      {/* Top Brand Navigation Bar */}
      <header className="border-b border-rule bg-canvas/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-xs font-mono text-ink-secondary hover:text-ink transition-colors group"
          >
            <Logo className="w-6 h-6 shrink-0 transition-transform group-hover:scale-105" />
            <span className="font-editorial text-lg tracking-tight font-medium text-ink">LedgerLens</span>
            <span className="hidden sm:inline text-ink-muted">/</span>
            <span className="hidden sm:inline text-[11px] text-ink-secondary">Financial Control Room</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono text-ink-secondary">
            <Link
              to="/"
              className="hover:text-ink underline decoration-rule hover:decoration-ink transition-colors"
            >
              Return to overview
            </Link>
            <span className="text-rule">|</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-resolved font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-resolved" />
              Engine Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Two-Zone Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* LEFT ZONE: Product Narrative & Reconciliation Proof Specimen */}
          <section
            aria-label="LedgerLens product narrative and reconciliation trace"
            className="lg:col-span-7 space-y-6 lg:space-y-8"
          >
            {/* Operational Kicker Tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface border border-rule rounded-xs text-[11px] font-mono text-ink-secondary shadow-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-resolved" />
              <span className="tracking-wider uppercase">Case Review</span>
            </div>

            {/* Editorial Headline & Narrative */}
            <div className="space-y-3.5">
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] leading-[1.14] font-normal text-ink tracking-tight">
                When four financial records do not agree, LedgerLens shows where the difference started.
              </h1>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-2xl font-sans">
                LedgerLens compares payments, provider payouts, refunds, and bank credits. When numbers disagree, it shows the exact difference, presents the approved rule, and saves a human decision.
              </p>
            </div>

            {/* Visual Proof Element: Example 4-Source Trace */}
            <div className="border border-rule bg-surface rounded-xs shadow-subtle overflow-hidden">
              {/* Header */}
              <div className="bg-surface-evidence px-4 py-2.5 border-b border-rule flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-critical animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink font-medium">
                    Example case with difference &bull; Case 08842
                  </span>
                </div>
                <span className="text-[10px] font-mono text-ink-muted">
                  Institutional Bank Statement
                </span>
              </div>

              {/* 4-Source Parity Rows */}
              <div className="divide-y divide-rule font-mono text-xs">
                {/* Source 1: Payment */}
                <div className="p-3 sm:px-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted w-20 shrink-0">1. Payment</span>
                    <div className="truncate">
                      <div className="text-ink font-medium truncate">pay_884291</div>
                      <div className="text-[10px] text-ink-secondary font-sans">What the customer paid</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-ink font-medium">₹10,000.00</div>
                    <span className="text-[10px] text-resolved inline-flex items-center gap-1 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-resolved" />
                      Received
                    </span>
                  </div>
                </div>

                {/* Source 2: Settlement */}
                <div className="p-3 sm:px-4 flex items-center justify-between gap-4 bg-canvas/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted w-20 shrink-0">2. Payout</span>
                    <div className="truncate">
                      <div className="text-ink font-medium truncate">set_77392</div>
                      <div className="text-[10px] text-ink-secondary font-sans">What provider sent (Fee ₹300 + GST ₹86)</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-ink font-medium">₹9,614.00</div>
                    <span className="text-[10px] text-ink-muted font-sans">Expected net</span>
                  </div>
                </div>

                {/* Source 3: Refund */}
                <div className="p-3 sm:px-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted w-20 shrink-0">3. Refund</span>
                    <div className="truncate">
                      <div className="text-ink-secondary truncate">No refund applies</div>
                      <div className="text-[10px] text-ink-muted font-sans">No customer return requested</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-ink-secondary">₹0.00</div>
                    <span className="text-[10px] text-ink-muted font-sans">None</span>
                  </div>
                </div>

                {/* Source 4: Bank Credit */}
                <div className="p-3 sm:px-4 flex items-center justify-between gap-4 bg-critical/5 border-l-2 border-l-critical">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-critical font-medium w-20 shrink-0">4. Bank Credit</span>
                    <div className="truncate">
                      <div className="text-ink font-medium truncate">UTR993201488102</div>
                      <div className="text-[10px] text-critical font-sans">Money received by the bank is short</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-critical font-semibold">₹9,464.00</div>
                    <span className="text-[10px] text-critical font-sans font-medium inline-flex items-center gap-1">
                      -₹150.00 missing
                    </span>
                  </div>
                </div>
              </div>

              {/* Specimen Policy & Audit Footer */}
              <div className="bg-surface-evidence/70 px-4 py-2.5 border-t border-rule text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-sans">
                <div className="flex items-center gap-1.5 text-ink-secondary">
                  <span className="font-mono text-[10px] bg-canvas border border-rule px-1.5 py-0.5 rounded-xs text-ink font-medium">
                    Technical reference: SOP-2026-BNK-03
                  </span>
                  <span>Difference over ₹50 requires human decision</span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-critical font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-critical" />
                  Human Review Required
                </div>
              </div>
            </div>

            {/* Core Architectural Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="border border-rule bg-surface p-3 rounded-xs space-y-1 shadow-subtle">
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-secondary">Four Records</div>
                <div className="text-xs font-medium text-ink">Checked to the nearest paisa</div>
                <p className="text-[11px] text-ink-muted leading-tight font-sans">Payments, provider payouts, refunds, and bank credits verified.</p>
              </div>
              <div className="border border-rule bg-surface p-3 rounded-xs space-y-1 shadow-subtle">
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-secondary">Approved Guidance</div>
                <div className="text-xs font-medium text-ink">Guidance for action</div>
                <p className="text-[11px] text-ink-muted leading-tight font-sans">Shows the approved rule so you know what to check next.</p>
              </div>
              <div className="border border-rule bg-surface p-3 rounded-xs space-y-1 shadow-subtle">
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-secondary">Human Authority</div>
                <div className="text-xs font-medium text-ink">Saved review history</div>
                <p className="text-[11px] text-ink-muted leading-tight font-sans">A person decides what to do. The decision is permanently saved.</p>
              </div>
            </div>
          </section>

          {/* RIGHT ZONE: Access Panel (Synthetic Demo Roles + Collapsible Credentials) */}
          <section
            aria-label="Sign in and demo access options"
            className="lg:col-span-5 space-y-4"
          >
            <div className="bg-surface border border-rule p-6 sm:p-8 rounded-xs shadow-subtle space-y-6">
              
              {/* Header */}
              <div className="space-y-1.5 border-b border-rule pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-ink-secondary block">
                    Financial case review
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-evidence border border-rule text-ink-secondary rounded-xs">
                    Demo data only
                  </span>
                </div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-ink">
                  Review financial cases
                </h2>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Sign in to compare records, read the approved rule, and save a human decision.
                </p>
              </div>

              {/* Error Banner */}
              {(localError || authError) && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="p-3 bg-critical/10 border border-critical/30 rounded-xs text-xs text-critical font-sans space-y-1"
                >
                  <span className="font-medium block">Unable to enter</span>
                  <p className="text-[11px] leading-normal">{localError || authError}</p>
                </div>
              )}

              {/* PRIMARY DEMO ACCESS: Demo Reviewer (Prominent & Emphasized) */}
              <div className="space-y-3">
                <button
                  type="button"
                  data-testid="login-demo-reviewer"
                  onClick={() => handleDemoAccess("reviewer")}
                  disabled={isSubmitting || isLoading}
                  className="w-full text-left p-4 border-2 border-resolved/80 bg-resolved/5 hover:bg-resolved/10 focus-visible:ring-2 focus-visible:ring-resolved focus-visible:outline-none rounded-xs transition-all group disabled:opacity-50 shadow-subtle cursor-pointer"
                >
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-resolved" />
                      <span className="text-sm font-semibold text-ink group-hover:text-resolved transition-colors">
                        Enter as Demo Reviewer
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-surface border border-resolved/30 text-resolved font-medium rounded-xs uppercase">
                      Primary Role
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed mt-1">
                    Inspect the live review queue, compare four-source evidence, read the approved rule, and record your decision.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-resolved/20 flex items-center justify-between text-xs font-mono text-resolved font-medium">
                    <span>Open Review Queue</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                {/* SECONDARY DEMO ACCESS: Administrator Access */}
                <button
                  type="button"
                  data-testid="login-demo-admin"
                  onClick={() => handleDemoAccess("admin")}
                  disabled={isSubmitting || isLoading}
                  className="w-full text-left p-3 border border-rule bg-canvas hover:bg-surface hover:border-ink/40 focus-visible:ring-1 focus-visible:ring-ink focus-visible:outline-none rounded-xs transition-all group disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between pb-1">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#A87931]" />
                      <span className="text-xs font-medium text-ink group-hover:text-[#A87931] transition-colors">
                        Administrator access
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-muted">
                      Admin Settings
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-secondary leading-tight">
                    Benchmark runs, fixture controls, and policy configuration.
                  </p>
                </button>
              </div>

              {/* Collapsed Disclosure: Use account credentials instead */}
              <div className="pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="w-full text-left py-1 text-xs font-mono text-ink-secondary hover:text-ink flex items-center justify-between cursor-pointer"
                >
                  <span>{showCredentials ? "Hide credentials form" : "Use account credentials instead"}</span>
                  <span className="text-xs">{showCredentials ? "▲" : "▼"}</span>
                </button>

                {showCredentials && (
                  <form onSubmit={handleManualLogin} aria-label="Sign in with email and password" className="space-y-3.5 pt-3">
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-medium text-ink block">
                        Work email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                        className="w-full px-3 py-2 bg-canvas border border-rule rounded-xs text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink transition-colors font-mono"
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="password" className="text-xs font-medium text-ink block">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full px-3 py-2 bg-canvas border border-rule rounded-xs text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink transition-colors"
                        autoComplete="current-password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="w-full py-2 bg-ink text-canvas text-xs font-medium rounded-xs hover:bg-ink/90 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink transition-colors disabled:opacity-50 shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-canvas animate-ping" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign in with credentials</span>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Institutional Footer Inside Card */}
              <div className="pt-3 border-t border-rule/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-ink-muted text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-resolved" />
                  Protected Session
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-ink-secondary" />
                  Permanent Audit Record
                </span>
              </div>
            </div>

            {/* Secondary Return Link */}
            <div className="text-center text-xs font-mono text-ink-secondary">
              <Link to="/" className="underline hover:text-ink">
                Return to the public explanation
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="border-t border-rule py-4 bg-canvas text-xs font-mono text-ink-secondary">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>LedgerLens &copy; 2026</span>
            <span className="mx-2 text-rule">|</span>
            <span>Financial Operations</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-ink underline decoration-rule hover:decoration-ink transition-colors">
              Public Overview
            </Link>
            <span className="text-rule">•</span>
            <Link to="/how-it-works" className="hover:text-ink underline decoration-rule hover:decoration-ink transition-colors">
              How It Works
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

