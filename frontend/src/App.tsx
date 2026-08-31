import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { CaseDetailPage } from './pages/CaseDetailPage';

export function App() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 flex flex-col antialiased">
      <Navbar onRefresh={handleGlobalRefresh} isRefreshing={isRefreshing} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {selectedCaseId ? (
          <CaseDetailPage
            key={`case-${selectedCaseId}-${refreshKey}`}
            caseId={selectedCaseId}
            onBack={() => setSelectedCaseId(null)}
          />
        ) : (
          <ReviewQueuePage
            key={`queue-${refreshKey}`}
            onSelectCase={(id) => setSelectedCaseId(id)}
          />
        )}
      </main>
      <footer className="border-t border-border-subtle py-4 px-6 text-center text-xs text-slate-500 font-mono">
        LedgerLens &bull; Financial Reconciliation Control Room &bull; Multi-Source Accounting &bull; Grounded Policy RAG
      </footer>
    </div>
  );
}

export default App;
