import { motion } from 'framer-motion';
import { Activity, Database, GitCommit, FileText } from 'lucide-react';

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

export default function HowItWorksPage() {
  const steps = [
    { 
      title: 'Deterministic Matching', 
      desc: 'The engine ingests 4 data streams: payments, refunds, settlements, and bank credits. It strictly enforces ACID invariants to find exact matches. Ambiguity is never guessed.',
      icon: Database
    },
    { 
      title: 'Exception Triaging', 
      desc: 'Only failed matches (discrepancies, missing credits, fee anomalies) are surfaced to the Queue. The noise is eliminated.',
      icon: Activity
    },
    { 
      title: 'Grounded Resolution', 
      desc: 'When an operator opens a case, an AI copilot grounds its analysis solely on the provided evidence JSON and the approved corporate policy manual.',
      icon: FileText
    },
    { 
      title: 'Immutable Audit Trail', 
      desc: 'Decisions are committed as append-only cryptographic receipts to the ledger. Accountability is absolute.',
      icon: GitCommit
    }
  ];

  return (
    <div className="bg-paper-0 min-h-screen pt-32 pb-24 px-6 overflow-hidden relative">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#C9C5BC20_1px,transparent_1px),linear-gradient(to_bottom,#C9C5BC20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div variants={STAGGER} initial="hidden" animate="show" className="mb-20 text-center">
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 mb-6">
             <span className="text-[10px] font-mono tracking-widest text-ink-700 uppercase border border-rule-300 px-3 py-1 rounded-full bg-white shadow-sm">
              Architecture
            </span>
          </motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl text-ink-900 font-display font-medium tracking-tight mb-6">
            The Operator Journey
          </motion.h1>
          <motion.p variants={FADE_UP} className="text-xl text-ink-700 font-sans max-w-2xl mx-auto leading-relaxed">
            From ingestion to resolution, LedgerLens enforces a strict, transparent, human-in-the-loop pipeline.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={STAGGER}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-6 relative before:absolute before:inset-0 before:ml-[27px] md:before:ml-[35px] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-source-blue/20 before:via-source-blue/20 before:to-transparent"
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={FADE_UP} className="relative flex items-start gap-6 md:gap-8 group">
              <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-paper-1 border-2 border-rule-300 flex items-center justify-center z-10 group-hover:border-source-blue group-hover:bg-source-blue/10 transition-colors shadow-sm">
                <step.icon className="w-6 h-6 text-ink-700 group-hover:text-source-blue transition-colors" />
              </div>
              <div className="flex-1 bg-white border border-rule-300 rounded-2xl p-6 md:p-8 shadow-sm group-hover:shadow-card group-hover:border-source-blue/30 transition-all">
                <div className="text-[10px] font-mono text-source-blue mb-2 tracking-widest uppercase">Phase 0{i + 1}</div>
                <h3 className="text-2xl text-ink-900 font-display font-medium mb-3">{step.title}</h3>
                <p className="text-ink-700 font-sans leading-relaxed text-sm md:text-base">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
