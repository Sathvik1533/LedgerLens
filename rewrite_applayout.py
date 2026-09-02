import re

path = 'frontend/src/layouts/AppLayout.tsx'
with open(path, 'r') as f:
    content = f.read()

new_content = """import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  AlertOctagon,
  FileSpreadsheet,
  ShieldCheck,
  BookOpen,
  Settings,
  Play,
  Command
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
    <div className="min-h-screen bg-paper-0 flex flex-col font-sans text-ink-900 selection:bg-source-blue/20 relative">
      
      {/* Apptains-style Floating Glass Navigation Dock */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-paper-0/80 backdrop-blur-xl border border-rule-300 rounded-full shadow-card"
      >
        <Link to="/" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-paper-1 transition mr-2 shrink-0 group">
          <Logo className="w-6 h-6 group-hover:scale-105 transition-transform" />
        </Link>
        
        <div className="flex items-center gap-1 border-l border-rule-300 pl-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center px-4 py-2 rounded-full group transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="dock-active"
                    className="absolute inset-0 bg-ink-900 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-ink-700 group-hover:text-ink-900 transition-colors'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-ink-700 group-hover:text-ink-900 transition-colors'} hidden md:block`}>
                    {item.label}
                  </span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`relative z-10 ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-ledger-vermilion/10 text-ledger-vermilion border border-ledger-vermilion/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="border-l border-rule-300 pl-3 ml-2 flex items-center">
           <button
            onClick={handleTriggerRecon}
            disabled={isRunningRecon}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-paper-1 border border-rule-300 hover:border-source-blue transition-all disabled:opacity-50"
            title="Run Recon Engine (Cmd+E)"
          >
            <Play className={`w-4 h-4 fill-ink-900 text-ink-900 ${isRunningRecon ? 'animate-pulse' : 'group-hover:text-source-blue group-hover:fill-source-blue'}`} />
          </button>
        </div>
      </motion.nav>

      {/* Main Workspace */}
      <main className="flex-1 min-h-screen pt-32 pb-12 relative flex flex-col bg-paper-0">
        <Outlet />
      </main>
    </div>
  );
}
"""
with open(path, 'w') as f:
    f.write(new_content)
