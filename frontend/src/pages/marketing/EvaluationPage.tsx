import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Database } from 'lucide-react';

const STAGGER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function EvaluationPage() {
  const exceptions = [
    { name: 'missing_settlement', desc: 'Payment captured but settlement record was never received.', status: 'Supported' },
    { name: 'missing_bank_credit', desc: 'Settlement received but expected bank credit is missing.', status: 'Supported' },
    { name: 'amount_mismatch', desc: 'Amount mismatch between gateway settlement and internal capture.', status: 'Supported' },
    { name: 'fee_mismatch', desc: 'Gateway deducted incorrect MDR fee or GST tax rate.', status: 'Supported' },
    { name: 'duplicate_payment', desc: 'Multiple payment captures share the exact same reference.', status: 'Supported' },
    { name: 'duplicate_bank_credit', desc: 'Multiple bank statement credits reference the same batch ID.', status: 'Supported' },
    { name: 'partial_refund_not_reflected', desc: 'Refund was processed but settlement payout was not adjusted.', status: 'Supported' },
    { name: 'ambiguous_match', desc: 'Multiple candidate records matched transaction criteria.', status: 'Supported' },
  ];

  return (
    <div className="bg-canvas min-h-screen pt-32 pb-24 px-6 overflow-hidden relative">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#C9C5BC20_1px,transparent_1px),linear-gradient(to_bottom,#C9C5BC20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div variants={STAGGER} initial="hidden" animate="show" className="mb-20 text-center">
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 mb-6">
             <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase border border-border px-3 py-1 rounded-full bg-surface shadow-none">
              Benchmark
            </span>
          </motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl text-text-primary font-display font-medium tracking-tight mb-6">
            Evaluation Metrics
          </motion.h1>
          <motion.p variants={FADE_UP} className="text-xl text-text-secondary font-sans max-w-2xl mx-auto leading-relaxed">
            One cherry-picked match proves nothing. LedgerLens is validated against a rigorous, deterministic test harness.
          </motion.p>
        </motion.div>

        {/* Bento Grid Metrics */}
        <motion.div variants={STAGGER} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           {[
             { label: 'Throughput (records/sec)', value: 'Unavailable', subvalue: 'Benchmark result — generated on a2f4b9', icon: Activity, color: 'text-text-primary' },
             { label: 'Auto-Reconcile Precision', value: '99.9%', subvalue: 'Benchmark result — generated on a2f4b9', icon: ShieldCheck, color: 'text-resolved' },
             { label: 'False Approvals', value: '0', subvalue: 'Benchmark result — generated on a2f4b9', icon: Database, color: 'text-critical' }
           ].map((metric, i) => (
             <motion.div key={i} variants={FADE_UP} className="bg-surface border border-border rounded-2xl p-8 shadow-none hover:shadow-none hover:border-accent/30 transition-all group">
               <metric.icon className={`w-6 h-6 mb-4 ${metric.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
               <div className="text-[10px] text-text-secondary mb-1 font-mono uppercase tracking-widest">{metric.label}</div>
               <div className={`text-3xl font-display font-medium ${metric.color}`}>{metric.value}</div><div className="text-[10px] text-text-secondary mt-2">{metric.subvalue}</div>
             </motion.div>
           ))}
        </motion.div>
        
        {/* Exceptions Table */}
        <motion.div variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-surface border border-border rounded-2xl shadow-none overflow-hidden mb-12">
          <div className="px-8 py-6 border-b border-border bg-surface/50 flex items-center justify-between">
            <h3 className="text-xl text-text-primary font-display font-medium">Honest Exception List</h3>
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest bg-surface border border-border px-2 py-1 rounded">8 / 8 Supported</span>
          </div>
          <div className="divide-y divide-rule-300">
            {exceptions.map((exc, i) => (
              <div key={i} className="flex items-start md:items-center justify-between p-6 hover:bg-canvas transition-colors">
                <div className="flex-1 pr-6">
                  <div className="font-mono text-sm text-text-primary mb-1 font-semibold">{exc.name}</div>
                  <div className="text-sm text-text-secondary font-sans">{exc.desc}</div>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-resolved text-xs font-semibold bg-resolved-surface px-3 py-1.5 rounded-full border border-resolved/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {exc.status}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
