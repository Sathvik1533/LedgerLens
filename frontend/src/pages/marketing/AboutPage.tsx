
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper-0 text-ink-900 pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-ink-900 font-medium mb-4">Manifesto</h1>
        
        <div className="prose prose-invert prose-lg text-ink-700 font-light mt-12">
          <p>We built LedgerLens because we were tired of generic AI dashboards.</p>
          <p>In finance operations, an LLM guessing if a transaction matches is not a feature; it's a liability. You cannot pay taxes on a "confidence score."</p>
          <p>We believe in:</p>
          <ul>
            <li><strong>No fake confidence scores.</strong> If the math doesn't match, it's an exception.</li>
            <li><strong>No black-box decisions.</strong> AI reads policy to guide you, but it never presses the "approve" button.</li>
            <li><strong>Built for operators.</strong> The interface should look like a terminal, not a marketing site.</li>
          </ul>
          <p className="text-ink-900 font-medium mt-8 text-xl">
            Built for finance operators who need to move from risk signal to human decision without losing context.
          </p>
        </div>
      </div>
    </div>
  );
}
