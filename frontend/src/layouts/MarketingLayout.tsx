import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';

export default function MarketingLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/how-it-works', label: 'How it works' },
    { path: '/evidence', label: 'Evidence' },
    { path: '/evaluation', label: 'Evaluation' },
    { path: '/docs', label: 'Docs' },
    { path: '/about', label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-rule selection:text-ink">
      {/* Editorial Restrained Navigation */}
      <header className="w-full border-b border-rule bg-canvas/90 sticky top-0 z-40 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <Logo className="w-7 h-7 text-ink transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-editorial text-xl font-semibold tracking-tight text-ink leading-none">
                LedgerLens
              </span>
              <span className="text-[10px] font-mono tracking-widest text-ink-secondary uppercase mt-0.5">
                Financial Operations
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-1 transition-colors ${
                    isActive
                      ? 'text-ink font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-ink'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              to="/app/queue"
              className="hidden sm:inline-block px-4 py-1.5 border border-ink text-ink hover:bg-ink hover:text-canvas text-xs font-medium rounded-xs transition-colors"
            >
              Open ledger
            </Link>
            
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink hover:bg-surface border border-rule rounded-xs text-xs font-mono"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-rule bg-canvas px-6 py-4 space-y-3 font-sans text-sm animate-fadeIn"
          >
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 border-b border-rule/40 transition-colors ${
                    isActive ? 'text-ink font-semibold' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                to="/app/queue"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2 bg-ink text-canvas text-xs font-medium rounded-xs"
              >
                Open ledger &rarr;
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Grounded Financial Footer */}
      <footer className="border-t border-rule bg-canvas py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-xs text-ink-secondary">
            <div className="space-y-1">
              <span className="font-editorial text-base text-ink font-semibold block">LedgerLens</span>
              <p className="font-sans text-xs text-ink-secondary max-w-md">
                A living financial ledger where every amount leaves a trace, every discrepancy is redlined, and every human decision becomes a dated record.
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-1 font-mono text-[11px] text-ink-secondary">
              <span>Four records checked &bull; Differences explained &bull; Human decisions saved</span>
              <span className="text-ink">Payments &bull; Provider payouts &bull; Refunds &bull; Bank credits</span>
              <span>Checked to the nearest paisa</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-rule/60 flex justify-between items-center text-[11px] font-mono text-ink-muted">
            <span>&copy; {new Date().getFullYear()} LedgerLens Financial Operations</span>
            <span>Rule checks for accuracy &bull; Human decisions for final action</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
