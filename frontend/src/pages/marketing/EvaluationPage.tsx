
export default function EvaluationPage() {
  return (
    <div className="min-h-screen bg-paper-0 text-ink-900 pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-ink-900 font-medium mb-4">Evaluation Metrics</h1>
        <p className="text-xl text-ink-700 mb-8">One cherry-picked match proves nothing. Here is our test harness.</p>

        <div className="control-panel p-8 border border-rule-300 rounded mb-12">
          <div className="flex items-center space-x-8 mb-8 pb-8 border-b border-rule-300">
             <div>
               <div className="text-sm text-ink-700 mb-1 font-mono uppercase">Throughput</div>
               <div className="text-3xl text-ink-900 font-medium">&gt; 1,000 rps</div>
             </div>
             <div>
               <div className="text-sm text-ink-700 mb-1 font-mono uppercase">Accuracy</div>
               <div className="text-3xl text-matched-green font-medium">100% Precision</div>
             </div>
             <div>
               <div className="text-sm text-ink-700 mb-1 font-mono uppercase">False Positives</div>
               <div className="text-3xl text-ink-900 font-medium">0</div>
             </div>
          </div>
          
          <h3 className="text-ink-900 font-medium mb-4">Honest Exception List</h3>
          <ul className="space-y-2 font-mono text-sm text-ink-700">
            <li>[x] missing_settlement</li>
            <li>[x] missing_bank_credit</li>
            <li>[x] amount_mismatch</li>
            <li>[x] fee_mismatch</li>
            <li>[x] duplicate_payment</li>
            <li>[x] duplicate_bank_credit</li>
            <li>[x] partial_refund_not_reflected</li>
            <li>[x] ambiguous_match</li>
          </ul>
        </div>
        
        <a href="/docs/evaluation.md" className="text-source-blue hover:text-blue-300 text-sm font-medium">
          Read full evaluation methodology →
        </a>
      </div>
    </div>
  );
}
