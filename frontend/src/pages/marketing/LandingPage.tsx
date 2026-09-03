import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Activity, Database, ChevronRight, FileDigit } from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const STAGGER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const AnimatedTerminal = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 bg-white border border-rule-300 rounded-xl shadow-none overflow-hidden relative">
      {/* Mac/Browser Header */}
      <div className="h-10 border-b border-rule-300 bg-paper-1 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rule-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-rule-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-rule-300" />
        </div>
        <div className="mx-auto flex items-center gap-2 px-3 py-1 bg-paper-0 border border-rule-300 rounded-md text-[10px] font-mono text-ink-700">
          <ShieldCheck className="w-3 h-3 text-matched-green" />
          ledgerlens.local/engine
        </div>
      </div>
      
      {/* Terminal Body */}
      <div className="p-6 md:p-10 text-left font-mono text-xs md:text-sm space-y-6 relative h-[320px]">
        
        {/* Step 0: Ingestion */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: step >= 0 ? 1 : 0, x: step >= 0 ? 0 : -20 }}
          className="flex items-center gap-4 text-ink-700"
        >
          <span className="text-source-blue font-bold">10:42:01</span>
          <span>&gt; Ingesting payment_pay_001928...</span>
        </motion.div>

        {/* Step 1: Scanning Settlements */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -20 }}
          className="flex items-center gap-4 text-ink-700"
        >
          <span className="text-source-blue font-bold">10:42:02</span>
          <span>&gt; Scanning candidate settlements...</span>
          {step === 1 && (
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-ink-900 inline-block"
            />
          )}
        </motion.div>

        {/* Step 2: Found Match, but discrepancy */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
          className="pl-20 border-l-2 border-ledger-vermilion/30 py-2 space-y-2"
        >
          <div className="flex justify-between items-center bg-paper-1 px-4 py-2 rounded border border-rule-300">
             <span className="text-ink-900 font-semibold">Captured: ₹2,151.74</span>
             <span className="text-ink-700">vs</span>
             <span className="text-ledger-vermilion font-semibold">Settled: ₹2,101.74</span>
          </div>
          <div className="flex items-center gap-2 text-ledger-vermilion bg-ledger-vermilion/10 px-3 py-1.5 rounded w-fit">
            <span className="w-1.5 h-1.5 bg-ledger-vermilion rounded-full animate-pulse" />
            <span className="font-bold tracking-widest uppercase text-[10px]">Critical: Amount Mismatch</span>
          </div>
        </motion.div>

        {/* Step 3: Flagged to Queue */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : -20 }}
          className="flex items-center gap-4 text-ink-700"
        >
          <span className="text-source-blue font-bold">10:42:04</span>
          <span>&gt; Flagged to Exception Control Room. Awaiting human review.</span>
        </motion.div>

        {/* Scanning Line overlay */}
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-source-blue/30 to-transparent shadow-[0_0_8px_rgba(53,106,136,0.5)] z-10 pointer-events-none"
        />
      </div>
    </div>
  );
};


export default function LandingPage() {
  
  

  return (
    <div className="bg-paper-0 selection:bg-source-blue/20 min-h-screen overflow-hidden">
      
      {/* Background Architectural Grid (Subtle Neuform aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#C9C5BC20_1px,transparent_1px),linear-gradient(to_bottom,#C9C5BC20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 px-6 max-w-6xl mx-auto border-b border-rule-300">
        <motion.div 
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={FADE_UP} className="flex items-center justify-center space-x-2 mb-8">
            <span className="text-[10px] font-mono tracking-widest text-ink-700 uppercase border border-rule-300 px-3 py-1 rounded-full bg-white shadow-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-source-blue animate-pulse" />
              Automated Financial Matching
            </span>
          </motion.div>
          
          <motion.h1 variants={FADE_UP} className="text-6xl md:text-8xl font-display font-medium tracking-tight text-ink-900 mb-8 leading-[1.05]">
            Stop losing money to <br className="hidden md:block"/> 
            <span className="relative inline-block">
              <span className="relative z-10">invisible</span>
              <span className="absolute bottom-1 md:bottom-3 left-0 w-full h-2 md:h-3 bg-ledger-vermilion/30 -z-0 rounded-full" />
            </span> reconciliation errors.
          </motion.h1>
          
          <motion.p variants={FADE_UP} className="text-lg text-ink-700 max-w-2xl mx-auto font-sans leading-relaxed mb-10">
            A financial control room that automatically reconciles payments, gateway settlements, refunds, and bank credits—surfacing exceptions directly to your human operators with full audit visibility.
          </motion.p>

          <motion.div variants={FADE_UP} className="flex items-center justify-center space-x-4">
            <Link to="/app/queue" className="group px-7 py-3.5 bg-ink-900 text-white font-semibold rounded-md shadow-none hover:bg-ink-700 transition-all relative overflow-hidden animate-shimmer flex items-center space-x-2 active:scale-95">
              <span>Open Control Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/how-it-works" className="px-7 py-3.5 bg-white text-ink-900 font-semibold rounded-md border border-rule-300 shadow-none hover:bg-paper-1 transition-all active:scale-95">
              See How It Works
            </Link>
          </motion.div>

          {/* Dynamic Mockup */}
          <motion.div variants={FADE_UP} className="mt-12 relative">
            <AnimatedTerminal />
          </motion.div>
        </motion.div>
      </section>

      {/* Value Props Section - Bento Grid Style */}
      <section className="relative z-10 py-32 px-6 bg-paper-1 border-b border-rule-300">
        <div className="max-w-6xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-display font-semibold text-ink-900 mb-4">Engineering over Aesthetics</h2>
            <p className="text-ink-700 max-w-2xl mx-auto text-lg">No generic dashboards. No vanity AI chatbots. LedgerLens is built on strict financial rules and permanent, time-stamped records.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white border border-rule-300 rounded-2xl p-8 shadow-none hover:shadow-none transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-source-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-source-blue" />
              </div>
              <h3 className="text-xl font-semibold text-ink-900 font-display mb-3">Exact Matching First</h3>
              <p className="text-sm text-ink-700 leading-relaxed font-sans">
                Matches records perfectly based on actual bank data. AI never guesses numbers—it only flags where the math fails.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white border border-rule-300 rounded-2xl p-8 shadow-none hover:shadow-none transition-all duration-300 group md:col-span-2 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-ledger-vermilion/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-ledger-vermilion" />
                </div>
                <h3 className="text-xl font-semibold text-ink-900 font-display mb-3">Exception-First Triage</h3>
                <p className="text-sm text-ink-700 leading-relaxed font-sans max-w-md">
                  Surfaces exactly what is broken: missing settlements, fee mismatches, and duplicated credits in a beautifully padded, high-density queue.
                </p>
              </div>
              {/* Decorative graphic in card */}
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity translate-x-1/4 translate-y-1/4">
                <FileDigit className="w-64 h-64 text-ink-900" />
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white border border-rule-300 rounded-2xl p-8 shadow-none hover:shadow-none transition-all duration-300 group md:col-span-2 relative overflow-hidden"
            >
               <div className="relative z-10">
                <div className="w-12 h-12 bg-matched-green/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-matched-green" />
                </div>
                <h3 className="text-xl font-semibold text-ink-900 font-display mb-3">Permanent Audit Logs</h3>
                <p className="text-sm text-ink-700 leading-relaxed font-sans max-w-md">
                  Every action taken by a human reviewer requires mandatory rationale and writes an immutable, append-only receipt to the system ledger.
                </p>
              </div>
            </motion.div>

             {/* Card 4 */}
             <motion.div 
              whileHover={{ y: -5 }}
              className="bg-ink-900 text-white border border-ink-700 rounded-2xl p-8 shadow-none transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold font-display mb-3">Ready to deploy?</h3>
                <p className="text-sm text-paper-1 opacity-80 leading-relaxed font-sans">
                  Instantly drop into the Queue and start triaging synthetic data today.
                </p>
              </div>
              <Link to="/app/queue" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-source-blue hover:text-white transition-colors">
                Launch Control Room <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
