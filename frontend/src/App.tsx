import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MarketingLayout from './layouts/MarketingLayout';
import AppLayout from './layouts/AppLayout';

// Marketing Pages
import LandingPage from './pages/marketing/LandingPage';
import HowItWorksPage from './pages/marketing/HowItWorksPage';
import EvidencePage from './pages/marketing/EvidencePage';
import EvaluationPage from './pages/marketing/EvaluationPage';
import DocsPage from './pages/marketing/DocsPage';
import AboutPage from './pages/marketing/AboutPage';

// App Pages
import QueuePage from './pages/app/QueuePage';
import CasePage from './pages/app/CasePage';
import { DashboardPage } from './pages/DashboardPage';
import { IngestionFeedsPage } from './pages/IngestionFeedsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { PolicyKnowledgePage } from './pages/PolicyKnowledgePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing Site (Public) */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* App Shell (Authenticated Financial Control Room) */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/queue" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="case/:caseId" element={<CasePage />} />
          <Route path="ingestion" element={<IngestionFeedsPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="policies" element={<PolicyKnowledgePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
