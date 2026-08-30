import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { CaseDetailPage } from './pages/CaseDetailPage';

export function App() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {selectedCaseId ? (
          <CaseDetailPage caseId={selectedCaseId} onBack={() => setSelectedCaseId(null)} />
        ) : (
          <ReviewQueuePage onSelectCase={(id) => setSelectedCaseId(id)} />
        )}
      </main>
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        Razorpay AI Finance Controller &bull; Deterministic Multi-Source Reconciliation &bull; Regulated Ops Review Engine
      </footer>
    </div>
  );
}

export default App;
