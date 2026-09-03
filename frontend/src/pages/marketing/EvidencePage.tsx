import { motion } from 'framer-motion';
import { Database, Link, Scale, Search, Key, Box } from 'lucide-react';

const STAGGER = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function EvidencePage() {
  const sources = [
    { title: 'Payments Capture', desc: 'Internal system of truth for original transaction intent and requested amount.', icon: Database },
    { title: 'Gateway Settlements', desc: 'External payload from Razorpay/Stripe detailing exact disbursed funds and MDR fees.', icon: Link },
    { title: 'Bank Statement Credits', desc: 'Immutable ground truth of actual fiat arriving in the corporate bank account.', icon: Box },
    { title: 'Refund Log', desc: 'Internal ledger of processed returns requiring corresponding deduction in settlement.', icon: Scale }
  ];

  return (
    <div className="bg-canvas min-h-screen pt-32 pb-24 px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#C9C5BC20_1px,transparent_1px),linear-gradient(to_bottom,#C9C5BC20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div variants={STAGGER} initial="hidden" animate="show" className="mb-20 text-center">
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 mb-6">
             <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase border border-border px-3 py-1 rounded-full bg-surface shadow-none">
              Data Model
            </span>
          </motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl text-text-primary font-display font-medium tracking-tight mb-6">
            Multi-Source Evidence
          </motion.h1>
          <motion.p variants={FADE_UP} className="text-xl text-text-secondary font-sans max-w-2xl mx-auto leading-relaxed">
            LedgerLens strictly enforces deterministic 4-way matching. We do not use LLMs to perform arithmetic or guess linkages.
          </motion.p>
        </motion.div>

        <motion.div variants={STAGGER} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {sources.map((src, i) => (
            <motion.div key={i} variants={FADE_UP} className="bg-surface border border-border rounded-2xl p-8 shadow-none hover:shadow-none hover:border-accent/30 transition-all group">
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                <src.icon className="w-5 h-5 text-text-primary group-hover:text-accent" />
              </div>
              <h3 className="text-xl text-text-primary font-display font-medium mb-2">{src.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{src.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-surface-raised text-paper-0 border border-ink-700 rounded-2xl p-8 shadow-none overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-critical" />
                <span className="text-[10px] font-mono text-critical uppercase tracking-widest">Invariant Protection</span>
              </div>
              <h3 className="text-2xl font-display font-medium mb-3">Optimistic Locking</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-paper-1/70">
                Every case in the queue has a strict <code className="text-text-primary font-mono bg-surface/10 px-1 py-0.5 rounded text-xs">lock_version</code>. If the underlying settlement data changes via an asynchronous webhook while an operator is reviewing the case, the system safely rejects their commit with an HTTP 409 Conflict.
              </p>
            </div>
            <div className="w-full md:w-64 h-32 bg-surface/5 rounded-lg border border-white/10 flex items-center justify-center p-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
               <Search className="w-8 h-8 text-text-primary/40" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
