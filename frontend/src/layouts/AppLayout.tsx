import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { fetchReviewQueue, triggerReconciliationRun, isSimulationActive } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useDemoSimulation } from '../context/DemoSimulationContext';
import { HowToUseRoomGuide } from '../components/HowToUseRoomGuide';
import { Logo } from '../components/Logo';

export default function AppLayout() {
  const location = useLocation();
  const { user, logout, showOnboarding, dismissOnboarding } = useAuth();
  const { isDemoMode, demoRun } = useDemoSimulation();
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isRunningRecon, setIsRunningRecon] = useState(false);
  const [reconMessage, setReconMessage] = useState<string | null>(null);

  const updateQueueCount = async () => {
    try {
      const data = await fetchReviewQueue();
      if (data && data.cases) {
        setQueueCount(data.cases.length);
      }
    } catch {
      // Quiet background failure handling
    }
  };

  useEffect(() => {
    updateQueueCount();
  }, [location.pathname]);

  const handleTriggerRecon = async () => {
    setIsRunningRecon(true);
    setReconMessage(null);
    try {
      await triggerReconciliationRun();
      await updateQueueCount();
      setReconMessage('Records compared');
      setTimeout(() => setReconMessage(null), 3000);
    } catch {
      setReconMessage('Record check interrupted');
      setTimeout(() => setReconMessage(null), 3000);
    } finally {
      setIsRunningRecon(false);
    }
  };

  const activeQueueBadge = isDemoMode && demoRun ? demoRun.reviewCount : queueCount;

  const navItems = [
    { path: '/app/dashboard', label: 'Overview' },
    { path: '/app/queue', label: 'Cases to review', badge: activeQueueBadge },
    { path: '/app/ingestion', label: 'Source files' },
    { path: '/app/audit', label: 'Saved review history' },
    { path: '/app/policies', label: 'Approved rules' },
    { path: '/app/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-rule selection:text-ink w-full max-w-full overflow-x-hidden">
      {/* Restrained Operational Header */}
      <header className="w-full border-b border-rule bg-canvas/95 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">
            <Link to="/" className="flex items-center space-x-2 group shrink-0">
              <Logo className="w-6 h-6 text-ink transition-transform group-hover:scale-105" />
              <span className="font-editorial text-lg font-semibold tracking-tight text-ink">
                LedgerLens
              </span>
            </Link>

            <span className="h-4 w-[1px] bg-rule hidden sm:block shrink-0" />
          </div>

          <nav className="flex items-center space-x-3 sm:space-x-5 text-xs overflow-x-auto py-1 max-w-[calc(100vw-180px)] sm:max-w-none whitespace-nowrap scrollbar-none">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative py-4 transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'text-ink font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-ink'
                        : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 font-mono text-[10px] rounded-xs ${
                        isActive 
                          ? 'bg-ink text-canvas font-semibold' 
                          : 'bg-oxide-red/10 text-oxide-red font-medium border border-oxide-red/20'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

          <div className="flex items-center gap-3 shrink-0">
            {reconMessage && (
              <span className="text-[11px] font-mono text-ink-secondary hidden md:inline-block">
                {reconMessage}
              </span>
            )}
            <button
              type="button"
              data-testid="guided-tour-btn"
              onClick={() => setIsGuideOpen(true)}
              className="px-2.5 py-1.5 border border-rule hover:border-ink bg-surface hover:bg-canvas text-ink text-xs font-medium rounded-xs transition-colors flex items-center gap-1.5"
              title="Open interactive room tour"
            >
              <span className="text-brass font-bold">✦</span>
              <span className="hidden sm:inline">Guided tour</span>
            </button>
            <button
              onClick={handleTriggerRecon}
              disabled={isRunningRecon}
              className="px-3 py-1.5 border border-rule-strong bg-surface hover:bg-canvas text-ink text-xs font-medium rounded-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isRunningRecon ? 'bg-brass animate-ping' : 'bg-ledger-green'}`} />
              <span>{isRunningRecon ? 'Comparing...' : 'Compare records'}</span>
            </button>

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-rule">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs font-medium text-ink">{user.full_name}</span>
                  <span className="px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-secondary bg-surface border border-rule rounded-xs">
                    {user.role === 'admin' ? 'Admin' : 'Reviewer'}
                  </span>
                </div>
                <button
                  data-testid="nav-logout"
                  onClick={() => logout()}
                  className="px-2.5 py-1.5 text-xs font-mono border border-rule hover:bg-canvas rounded-xs text-ink-secondary hover:text-ink transition-colors cursor-pointer"
                  title="Sign out of LedgerLens"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Simulation / Offline Banner */}
      {isSimulationActive() && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2 font-sans text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              <strong>[Simulation Mode Active]:</strong> Backend &amp; PostgreSQL are not reachable. The workspace is operating in client simulation mode using browser persistence.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-200/60 px-2 py-0.5 rounded text-amber-900">
            Client Simulation
          </span>
        </div>
      )}

      {/* Plain-Language Onboarding Banner */}
      {showOnboarding && (
        <div className="bg-surface border-b border-rule px-4 sm:px-6 py-3 font-sans">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brass" />
                <span className="font-medium text-ink">Welcome to LedgerLens. Here is how to investigate:</span>
              </div>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                1. Choose records &bull; 2. Open a case needing attention &bull; 3. Compare the four records &bull; 4. Read the approved rule &bull; 5. Record a human decision &bull; 6. Check the saved history
              </p>
            </div>
            <button
              onClick={dismissOnboarding}
              className="self-start md:self-center px-2 py-1 border border-rule hover:bg-canvas text-ink-secondary hover:text-ink text-[11px] font-mono rounded-xs transition-colors shrink-0"
            >
              Dismiss guide [×]
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Subtle Operational Sub-footer */}
      <footer className="border-t border-rule bg-canvas/60 py-3 text-[11px] font-mono text-ink-muted">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ledger-green" />
            <span>Four records checked &bull; Differences explained</span>
          </div>
          <span>Human decisions saved</span>
        </div>
      </footer>

      {/* Dynamic Operational Room Guide */}
      <HowToUseRoomGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
