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
  Play
} from 'lucide-react';
import { fetchReviewQueue, triggerReconciliationRun } from '../api/client';
import { Logo } from '../components/Logo';


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
    { path: '/app/queue', label: 'Queue', icon: AlertOctagon, badge: queueCount },
    { path: '/app/ingestion', label: 'Feeds', icon: FileSpreadsheet },
    { path: '/app/audit', label: 'Ledger', icon: ShieldCheck },
    { path: '/app/policies', label: 'Policies', icon: BookOpen },
    { path: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen bg-canvas flex font-sans text-text-primary selection:bg-accent/20 overflow-hidden">
      
      {/* Direction A: Slim Fixed Sidebar */}
      <nav className="w-16 md:w-56 shrink-0 border-r border-border bg-surface flex flex-col justify-between h-full overflow-y-auto overscroll-contain">
        
        <div>
          <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="w-6 h-6 group-hover:scale-105 transition-transform" />
              <span className="font-display font-bold text-text-primary hidden md:block tracking-tight">LedgerLens</span>
            </Link>
          </div>

          <div className="p-2 md:p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-md transition-colors relative group ${isActive ? 'bg-rule-300 text-text-primary' : 'text-text-secondary hover:bg-canvas hover:text-text-primary'}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium hidden md:block">
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`hidden md:flex absolute right-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-surface text-text-primary shadow-none border border-border' : 'bg-critical-surface text-critical border border-critical/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-center md:justify-start">
           <button
            onClick={handleTriggerRecon}
            disabled={isRunningRecon}
            className="flex items-center justify-center md:justify-start gap-2 w-full px-2 md:px-3 py-2 rounded-md bg-canvas border border-border hover:border-accent transition-all disabled:opacity-50"
            title="Run Recon Engine (Cmd+E)"
          >
            <Play className={`w-4 h-4 fill-text-primary text-text-primary shrink-0 ${isRunningRecon ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-semibold hidden md:block">Run Recon</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 h-full relative flex flex-col bg-canvas overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
    </div>
  );
}
