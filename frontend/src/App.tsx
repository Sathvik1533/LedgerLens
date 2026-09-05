import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import { TooltipProvider } from './components/Tooltip';


import { AuthProvider } from './context/AuthContext';
import { DemoSimulationProvider } from './context/DemoSimulationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';

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

// Visual Concept Review Gate (Document 44)
import ConceptReviewGatePage from './pages/concepts/ConceptReviewGatePage';
import ConceptALanding from './pages/concepts/ConceptALanding';
import ConceptACase from './pages/concepts/ConceptACase';
import ConceptBLanding from './pages/concepts/ConceptBLanding';
import ConceptBCase from './pages/concepts/ConceptBCase';
import ConceptCLanding from './pages/concepts/ConceptCLanding';
import ConceptCCase from './pages/concepts/ConceptCCase';


function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <TooltipProvider>
      <AuthProvider>
        <DemoSimulationProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Marketing Site (Public pages) */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Public Evaluation & Evidence */}
              <Route path="/evidence" element={<EvidencePage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
            </Route>

            {/* App Shell (Authenticated Financial Control Room) */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/queue" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="queue" element={<QueuePage />} />
              <Route path="case/:caseId" element={<CasePage />} />
              <Route path="ingestion" element={<IngestionFeedsPage />} />
              <Route path="audit" element={<AuditLogPage />} />
              <Route path="policies" element={<PolicyKnowledgePage />} />
              <Route
                path="settings"
                element={
                  <ProtectedRoute requireAdmin>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Concept Review Gate Routes (Document 44 Gate) */}
            <Route path="/concepts" element={<ConceptReviewGatePage />} />
            <Route path="/concept/a" element={<ConceptALanding />} />
            <Route path="/concept/a/case" element={<ConceptACase />} />
            <Route path="/concept/b" element={<ConceptBLanding />} />
            <Route path="/concept/b/case" element={<ConceptBCase />} />
            <Route path="/concept/c" element={<ConceptCLanding />} />
            <Route path="/concept/c/case" element={<ConceptCCase />} />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DemoSimulationProvider>
    </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
