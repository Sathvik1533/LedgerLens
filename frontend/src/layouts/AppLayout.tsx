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
    <div className="min-h-screen bg-canvas flex flex-col font-sans text-text-primary selection:bg-accent/20 relative">
      
      {/* Apptains-style Floating Glass Navigation Dock */}
      <div className="w-full border-b border-border bg-canvas flex justify-center px-4 py-3">
        <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex items-center p-1.5 max-w-full overflow-x-auto no-scrollbar"
      >
        <Link to="/" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition mr-2 shrink-0 group">
          <Logo className="w-6 h-6 group-hover:scale-105 transition-transform" />
        </Link>
        
        <div className="flex items-center gap-1 md:gap-2 border-l border-border pl-2 md:pl-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center px-3 md:px-4 py-2 rounded-full group transition-colors shrink-0"
              >
                {isActive && (
                  <motion.div
                    layoutId="dock-active"
                    className="absolute inset-0 bg-surface-raised rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary transition-colors'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary transition-colors'} hidden xl:block`}>
                    {item.label}
                  </span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`relative z-10 ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-surface/20 text-text-primary' : 'bg-critical-surface text-critical border border-critical/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="border-l border-border pl-3 ml-2 flex items-center">
           <button
            onClick={handleTriggerRecon}
            disabled={isRunningRecon}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border hover:border-accent transition-all disabled:opacity-50"
            title="Run Recon Engine (Cmd+E)"
          >
            <Play className={`w-4 h-4 fill-text-primary text-text-primary ${isRunningRecon ? 'animate-pulse' : 'group-hover:text-accent group-hover:fill-source-blue'}`} />
          </button>
        </div>
      </motion.nav>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 pb-12 relative flex flex-col bg-canvas">
        <Outlet />
      </main>
    </div>
  );
}
