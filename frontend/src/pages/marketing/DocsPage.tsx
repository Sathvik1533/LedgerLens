import { motion } from 'framer-motion';
import { BookOpen, FileCode, Shield, GitBranch } from 'lucide-react';

const FADE_UP = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

export default function DocsPage() {
  const categories = [
    { title: 'Data Contracts', desc: 'Strict JSON schemas for payments, settlements, and webhooks.', icon: FileCode },
    { title: 'Reconciliation Algorithms', desc: 'The exact deterministic formulas used to match multi-source streams.', icon: GitBranch },
    { title: 'Security & Privacy', desc: 'How we enforce SOX compliance and isolate financial data.', icon: Shield },
    { title: 'Policy Engine', desc: 'Writing natural-language SOPs that ground the AI Copilot.', icon: BookOpen }
  ];

  return (
    <div className="bg-canvas min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="mb-16 text-center">
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 mb-6">
             <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase border border-border px-3 py-1 rounded-full bg-surface shadow-none">Technical Reference</span>
          </motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl text-text-primary font-display font-medium tracking-tight mb-6">Documentation</motion.h1>
          <motion.p variants={FADE_UP} className="text-xl text-text-secondary max-w-2xl mx-auto">Open-source architectural guides for implementing LedgerLens.</motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((c, i) => (
             <motion.div key={i} initial="hidden" animate="show" variants={FADE_UP} className="bg-surface border border-border rounded-2xl p-8 shadow-none hover:shadow-none hover:border-accent/30 transition-all cursor-pointer group">
               <c.icon className="w-6 h-6 mb-4 text-text-secondary group-hover:text-accent" />
               <h3 className="text-xl text-text-primary font-display font-medium mb-2">{c.title}</h3>
               <p className="text-text-secondary text-sm leading-relaxed">{c.desc}</p>
             </motion.div>
          ))}
        </div>
      
        <motion.div variants={FADE_UP} className="mt-16 bg-surface border border-border rounded-2xl p-8 shadow-none">
          <h3 className="text-xl text-text-primary font-display font-bold mb-6">Design System: Direction A (The Clear Ledger)</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-mono text-text-secondary uppercase tracking-widest mb-4">Typography</h4>
              <div className="grid gap-4">
                <div className="flex items-baseline gap-4 border-b border-border pb-2">
                  <div className="font-display font-bold text-4xl text-text-primary w-32">Aa</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-text-primary">Manrope (Display & Headings)</span>
                    <span className="text-text-secondary">Weights: 500, 600, 700, 800</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4 border-b border-border pb-2">
                  <div className="font-sans text-3xl text-text-primary w-32">Aa</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-text-primary">Inter (UI & Data)</span>
                    <span className="text-text-secondary">Weights: 400, 500, 600</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  <div className="font-mono text-2xl text-text-primary w-32">0123</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-text-primary">Geist Mono (Identifiers & Hashes)</span>
                    <span className="text-text-secondary">Weights: 400, 500</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono text-text-secondary uppercase tracking-widest mb-4">Color Palette</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-12 w-full rounded border border-border bg-canvas"></div>
                  <div className="text-xs"><span className="font-semibold text-text-primary block">Canvas</span><span className="text-text-secondary font-mono text-[10px]">#111111 (canvas)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded border border-border bg-surface"></div>
                  <div className="text-xs"><span className="font-semibold text-text-primary block">Surface</span><span className="text-text-secondary font-mono text-[10px]">#1E1E1E (surface)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-surface-raised"></div>
                  <div className="text-xs"><span className="font-semibold text-text-primary block">Primary Text</span><span className="text-text-secondary font-mono text-[10px]">#F3F4F6 (text-primary)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-ink-700"></div>
                  <div className="text-xs"><span className="font-semibold text-text-primary block">Secondary Text</span><span className="text-text-secondary font-mono text-[10px]">#9CA3AF (text-secondary)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-rule-300"></div>
                  <div className="text-xs"><span className="font-semibold text-text-primary block">Borders</span><span className="text-text-secondary font-mono text-[10px]">#333333 (border)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-critical"></div>
                  <div className="text-xs"><span className="font-semibold text-text-primary block">Critical</span><span className="text-text-secondary font-mono text-[10px]">#EF4444 (critical)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-high"></div>
                  <div className="text-xs"><span className="font-semibold text-text-primary block">High / Review</span><span className="text-text-secondary font-mono text-[10px]">#F59E0B (high)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-resolved"></div>
                  <div className="text-xs"><span className="font-semibold text-text-primary block">Resolved</span><span className="text-text-secondary font-mono text-[10px]">#10B981 (resolved)</span></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
