import { motion } from 'framer-motion';

const FADE_UP = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

export default function AboutPage() {
  return (
    <div className="bg-paper-0 min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 mb-6">
             <span className="text-[10px] font-mono tracking-widest text-ink-700 uppercase border border-rule-300 px-3 py-1 rounded-full bg-white shadow-none">Board</span>
          </motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl text-ink-900 font-display font-medium tracking-tight mb-8">
            The Team Behind the Ledger
          </motion.h1>
          <motion.p variants={FADE_UP} className="text-xl text-ink-700 leading-relaxed mb-16">
            We are a collective of former Razorpay and Stripe engineers obsessed with eradicating financial reconciliation exceptions through extreme determinism.
          </motion.p>
          <motion.div variants={FADE_UP} className="bg-white border border-rule-300 rounded-2xl p-8 shadow-none text-left">
            <h3 className="text-xl text-ink-900 font-display font-medium mb-4">Our Core Philosophy</h3>
            <p className="text-ink-700 leading-relaxed text-sm mb-4">
              AI should not be allowed to perform final arithmetic on corporate ledgers. It is a reasoning engine, not a calculator. We built LedgerLens to separate the deterministic math (which software does perfectly) from the complex exception analysis (which AI does perfectly).
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
