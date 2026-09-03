import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';

export default function MarketingLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'text-ink-900 font-semibold' : 'text-ink-700 hover:text-ink-900';

  return (
    <div className="min-h-screen bg-paper-0 flex flex-col font-sans">
      <nav className="w-full bg-paper-0 border-b border-rule-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <Logo className="w-8 h-8" />
            <span className="text-ink-900 font-display font-semibold tracking-tight text-lg">LedgerLens</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link to="/how-it-works" className={isActive('/how-it-works')}>How it works</Link>
            <Link to="/evidence" className={isActive('/evidence')}>Evidence</Link>
            <Link to="/evaluation" className={isActive('/evaluation')}>Evaluation</Link>
            <Link to="/docs" className={isActive('/docs')}>Docs</Link>
            <Link to="/about" className={isActive('/about')}>About</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/app/queue" className="px-5 py-2 bg-ink-900 text-white font-semibold text-sm rounded shadow-sm hover:bg-ink-700 transition-colors">
              Open App
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-rule-300 py-12 bg-paper-1">
        <div className="max-w-6xl mx-auto px-6 text-xs text-ink-700 flex justify-between items-center font-mono uppercase tracking-widest">
          <span>LEDGERLENS &copy; 2026</span>
          <span>DETERMINISTIC 3-WAY PARITY ENGINE</span>
        </div>
      </footer>
    </div>
  );
}
