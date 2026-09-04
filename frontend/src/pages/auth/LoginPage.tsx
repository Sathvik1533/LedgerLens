import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-6 font-sans">
      {/* Top Brand Link */}
      <div className="max-w-md w-full mx-auto pt-6 pb-2">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-ink-secondary hover:text-ink transition-colors">
          <span className="w-2 h-2 rounded-full bg-ledger-green" />
          <span className="font-editorial text-lg tracking-tight font-medium text-ink">LedgerLens</span>
          <span className="text-[11px] text-ink-secondary">/ Financial Control Room</span>
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        <div className="bg-surface border border-rule p-8 rounded-xs shadow-subtle space-y-6">
          {/* Header */}
          <div className="space-y-1.5 border-b border-rule pb-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block">
              SECURE OPERATING ROOM ENTRY
            </span>
            <h1 className="font-editorial text-3xl font-medium text-ink">
              Sign in to LedgerLens
            </h1>
            <p className="text-xs text-ink-secondary leading-relaxed">
              When financial records disagree, LedgerLens identifies the exact difference, presents the evidence, and records human decisions.
            </p>
          </div>

          {/* Error Banner */}
          {(localError || authError) && (
            <div className="p-3 bg-critical/10 border border-critical/30 rounded-xs text-xs text-critical font-sans space-y-1">
              <span className="font-medium block">Unable to sign in</span>
              <p className="text-[11px] leading-normal">{localError || authError}</p>
            </div>
          )}

          {/* Section 1: One-Click Evaluator Demo Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink">One-click reviewer access</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-canvas border border-rule text-ink-secondary rounded-xs">
                Synthetic Demo Data
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoAccess("reviewer")}
                disabled={isSubmitting || isLoading}
                className="p-3 text-left border border-rule bg-canvas hover:bg-surface hover:border-ink/40 rounded-xs transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-medium text-ink group-hover:text-ledger-green transition-colors">
                    Demo Reviewer
                  </span>
                  <span className="text-[10px] font-mono text-ink-secondary">Role</span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-tight">
                  Inspect queue cases and record decisions.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess("admin")}
                disabled={isSubmitting || isLoading}
                className="p-3 text-left border border-rule bg-canvas hover:bg-surface hover:border-ink/40 rounded-xs transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-medium text-ink group-hover:text-brass transition-colors">
                    Administrator
                  </span>
                  <span className="text-[10px] font-mono text-ink-secondary">Role</span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-tight">
                  Run benchmarks, reset data, and review policies.
                </p>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-rule w-full" />
            <span className="bg-surface px-3 text-[11px] font-mono text-ink-secondary uppercase">
              Or with credentials
            </span>
          </div>

          {/* Section 2: Standard Sign In Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink block">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 bg-canvas border border-rule rounded-xs text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:border-ink transition-colors"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-ink block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-canvas border border-rule rounded-xs text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:border-ink transition-colors"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-2.5 bg-ink text-canvas text-xs font-medium rounded-xs hover:bg-ink/90 transition-colors disabled:opacity-50 shadow-subtle flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-canvas animate-ping" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in to Control Room</span>
              )}
            </button>
          </form>

          {/* Institutional footer disclaimer */}
          <div className="pt-2 text-center text-[11px] text-ink-secondary font-mono border-t border-rule/60">
            <span>HttpOnly SameSite Session Protection</span>
            <span className="mx-1.5">&bull;</span>
            <span>Append-Only Audit Logging</span>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="max-w-md w-full mx-auto text-center py-4 text-xs font-mono text-ink-secondary">
        <Link to="/" className="underline hover:text-ink">
          Return to LedgerLens Home
        </Link>
      </div>
    </div>
  );
};
