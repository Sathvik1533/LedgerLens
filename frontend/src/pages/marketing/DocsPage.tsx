
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-paper-0 text-ink-900 pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-ink-900 font-medium mb-4">Documentation</h1>
        <p className="text-xl text-ink-700 mb-8">Architecture, API contracts, deployment, policies.</p>
        
        <div className="border border-rule-300 rounded p-8 bg-card text-sm text-ink-700 font-mono">
          &gt; Placeholder for documentation viewer. 
          &gt; In production, this would render markdown files from /docs.
        </div>
      </div>
    </div>
  );
}
