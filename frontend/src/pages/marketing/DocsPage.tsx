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
             <span className="text-[10px] font-mono tracking-widest text-ink-700 uppercase border border-rule-300 px-3 py-1 rounded-full bg-white shadow-sm">Technical Reference</span>
          </motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl text-ink-900 font-display font-medium tracking-tight mb-6">Documentation</motion.h1>
          <motion.p variants={FADE_UP} className="text-xl text-ink-700 max-w-2xl mx-auto">Open-source architectural guides for implementing LedgerLens.</motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((c, i) => (
             <motion.div key={i} initial="hidden" animate="show" variants={FADE_UP} className="bg-white border border-rule-300 rounded-2xl p-8 shadow-sm hover:shadow-card hover:border-source-blue/30 transition-all cursor-pointer group">
               <c.icon className="w-6 h-6 mb-4 text-ink-700 group-hover:text-source-blue" />
               <h3 className="text-xl text-ink-900 font-display font-medium mb-2">{c.title}</h3>
               <p className="text-ink-700 text-sm leading-relaxed">{c.desc}</p>
             </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
