
export default function EvidencePage() {
  return (
    <div className="min-h-screen bg-paper-0 text-ink-900 pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-ink-900 font-medium mb-4">Reconciliation Evidence</h1>
        <p className="text-xl text-ink-700 mb-16">How 4-source reconciliation actually works under the hood.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="control-panel p-8 border border-rule-300 rounded">
            <h3 className="text-ink-900 font-medium mb-4">4-Source Determinism</h3>
            <p className="text-sm text-ink-700">We do not use LLMs to do math. We deterministically join Payments, Gateway Settlements, Refunds, and Bank Credits on foreign keys and formulas.</p>
          </div>
          <div className="control-panel p-8 border border-rule-300 rounded">
            <h3 className="text-ink-900 font-medium mb-4">Grounded AI</h3>
            <p className="text-sm text-ink-700">AI is restricted to reading contracts and surfacing policies (RAG) with strict Cosine Similarity floors. It cannot approve transactions.</p>
          </div>
          <div className="control-panel p-8 border border-rule-300 rounded">
            <h3 className="text-ink-900 font-medium mb-4">Optimistic Locking</h3>
            <p className="text-sm text-ink-700">Every case has a strict `lock_version`. If the underlying data changes while an operator is reviewing it, the commit is rejected (HTTP 409).</p>
          </div>
          <div className="control-panel p-8 border border-rule-300 rounded">
            <h3 className="text-ink-900 font-medium mb-4">Audit Trail</h3>
            <p className="text-sm text-ink-700">Every decision, automated or human, is written to an append-only ledger with the actor's identity and justification.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
