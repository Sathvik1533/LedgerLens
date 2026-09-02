import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  AlertOctagon,
  FileSpreadsheet,
  ShieldCheck,
  BookOpen,
  Settings,
  RefreshCw,
  Play,
  Command
} from 'lucide-react';
import { fetchReviewQueue, triggerReconciliationRun } from '../api/client';

export default function AppLayout() {
  const location = useLocation();
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isRunningRecon, setIsRunningRecon] = useState(false);

  useEffect(() => {
    fetchReviewQueue().then(data => {
      if (data && data.cases) setQueueCount(data.cases.length);
    }).catch(() => {});
  }, [location.pathname]);

  const handleTriggerRecon = async () => {
    setIsRunningRecon(true);
    try {
      await triggerReconciliationRun();
      const data = await fetchReviewQueue();
      if (data && data.cases) setQueueCount(data.cases.length);
    } catch {} finally {
      setIsRunningRecon(false);
    }
  };

  const navItems = [
    { path: '/app/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/app/queue', label: 'Exception Queue', icon: AlertOctagon, badge: queueCount },
    { path: '/app/ingestion', label: 'Source Feeds', icon: FileSpreadsheet },
    { path: '/app/audit', label: 'Audit Ledger', icon: ShieldCheck },
    { path: '/app/policies', label: 'Policy Knowledge', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-paper-0 flex font-sans text-ink-900 selection:bg-source-blue/20">
      {/* Sidebar - Paper-1 Surface (Light & Airy) */}
      <aside className="w-[260px] bg-paper-1 border-r border-rule-300 flex flex-col fixed h-full z-40">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-7 w-7 bg-ink-900 text-paper-0 flex items-center justify-center font-display font-bold text-sm rounded shadow-sm">
              LL
            </div>
            <div>
              <div className="text-lg font-display font-semibold text-ink-900 tracking-tight leading-none">
                LedgerLens
              </div>
            </div>
          </Link>
        </div>

        {/* Engine Trigger */}
        <div className="px-4 py-3">
          <button
            onClick={handleTriggerRecon}
            disabled={isRunningRecon}
            className="w-full py-2 px-3 bg-white hover:bg-paper-0 active:scale-[0.98] transition-all disabled:opacity-50 text-ink-900 border border-rule-300 rounded-md text-xs font-semibold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              {isRunningRecon ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-ink-900" />
              )}
              <span>Run Engine</span>
            </div>
            <div className="flex items-center gap-1 opacity-50">
              <Command className="w-3 h-3" />
              <span className="font-mono text-[10px]">E</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center justify-between px-3 py-2 rounded-md group"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white border border-rule-300 rounded-md shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 text-sm">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-ink-900' : 'text-ink-700 group-hover:text-ink-900 transition-colors'}`} />
                  <span className={`font-medium ${isActive ? 'text-ink-900' : 'text-ink-700 group-hover:text-ink-900 transition-colors'}`}>
                    {item.label}
                  </span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-ledger-vermilion/10 text-ledger-vermilion border border-ledger-vermilion/20' : 'bg-rule-300/30 text-ink-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-8 mb-2 px-3">
            <div className="h-px w-full bg-rule-300"></div>
          </div>
          
          <Link
            to="/app/settings"
            className="relative flex items-center gap-3 px-3 py-2 rounded-md group"
          >
            {location.pathname.startsWith('/app/settings') && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 bg-white border border-rule-300 rounded-md shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-3 text-sm">
              <Settings className={`w-4 h-4 ${location.pathname.startsWith('/app/settings') ? 'text-ink-900' : 'text-ink-700 group-hover:text-ink-900'}`} />
              <span className={`font-medium ${location.pathname.startsWith('/app/settings') ? 'text-ink-900' : 'text-ink-700 group-hover:text-ink-900'}`}>
                Settings
              </span>
            </div>
          </Link>
        </nav>

        {/* Operator Profile */}
        <div className="p-4 border-t border-rule-300">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-paper-0 border border-rule-300 flex items-center justify-center text-ink-900 font-mono text-xs shadow-sm">
              FA
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-900">Finance Analyst</div>
              <div className="text-[10px] font-mono text-ink-700">Active Session</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 ml-[260px] min-h-screen relative flex flex-col bg-paper-0">
        <Outlet />
      </main>
    </div>
  );
}
