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
    <div className="bg-paper-0 min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="mb-16 text-center">
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 mb-6">
             <span className="text-[10px] font-mono tracking-widest text-ink-700 uppercase border border-rule-300 px-3 py-1 rounded-full bg-white shadow-none">Technical Reference</span>
          </motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl text-ink-900 font-display font-medium tracking-tight mb-6">Documentation</motion.h1>
          <motion.p variants={FADE_UP} className="text-xl text-ink-700 max-w-2xl mx-auto">Open-source architectural guides for implementing LedgerLens.</motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((c, i) => (
             <motion.div key={i} initial="hidden" animate="show" variants={FADE_UP} className="bg-white border border-rule-300 rounded-2xl p-8 shadow-none hover:shadow-none hover:border-source-blue/30 transition-all cursor-pointer group">
               <c.icon className="w-6 h-6 mb-4 text-ink-700 group-hover:text-source-blue" />
               <h3 className="text-xl text-ink-900 font-display font-medium mb-2">{c.title}</h3>
               <p className="text-ink-700 text-sm leading-relaxed">{c.desc}</p>
             </motion.div>
          ))}
        </div>
      
        <motion.div variants={FADE_UP} className="mt-16 bg-white border border-rule-300 rounded-2xl p-8 shadow-none">
          <h3 className="text-xl text-ink-900 font-display font-bold mb-6">Design System: Direction A (The Clear Ledger)</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-mono text-ink-700 uppercase tracking-widest mb-4">Typography</h4>
              <div className="grid gap-4">
                <div className="flex items-baseline gap-4 border-b border-rule-300 pb-2">
                  <div className="font-display font-bold text-4xl text-ink-900 w-32">Aa</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-ink-900">Manrope (Display & Headings)</span>
                    <span className="text-ink-700">Weights: 500, 600, 700, 800</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4 border-b border-rule-300 pb-2">
                  <div className="font-sans text-3xl text-ink-900 w-32">Aa</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-ink-900">Inter (UI & Data)</span>
                    <span className="text-ink-700">Weights: 400, 500, 600</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  <div className="font-mono text-2xl text-ink-900 w-32">0123</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-ink-900">Geist Mono (Identifiers & Hashes)</span>
                    <span className="text-ink-700">Weights: 400, 500</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono text-ink-700 uppercase tracking-widest mb-4">Color Palette</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-12 w-full rounded border border-rule-300 bg-paper-0"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Canvas</span><span className="text-ink-700 font-mono text-[10px]">#F9F9FB (paper-0)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded border border-rule-300 bg-paper-1"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Surface</span><span className="text-ink-700 font-mono text-[10px]">#FFFFFF (paper-1)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-ink-900"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Primary Text</span><span className="text-ink-700 font-mono text-[10px]">#111827 (ink-900)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-ink-700"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Secondary Text</span><span className="text-ink-700 font-mono text-[10px]">#4B5563 (ink-700)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-rule-300"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Borders</span><span className="text-ink-700 font-mono text-[10px]">#E5E7EB (rule-300)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-ledger-vermilion"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Critical</span><span className="text-ink-700 font-mono text-[10px]">#DC2626 (vermilion)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-advisory-amber"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">High / Review</span><span className="text-ink-700 font-mono text-[10px]">#D97706 (amber)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-matched-green"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Resolved</span><span className="text-ink-700 font-mono text-[10px]">#059669 (green)</span></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
