import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAdmin = false,
  children,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-ink">
        <div className="flex items-center gap-3 p-4 bg-surface border border-rule rounded-xs shadow-subtle font-mono text-xs text-ink-secondary">
          <span className="w-2 h-2 rounded-full bg-brass animate-ping" />
          <span>Verifying operating room session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full p-8 bg-surface border border-rule rounded-xs space-y-4 shadow-subtle">
          <div className="w-2.5 h-2.5 rounded-full bg-critical mx-auto" />
          <div className="text-xs font-mono uppercase text-ink-secondary tracking-wider">
            Permission Restricted
          </div>
          <h2 className="font-editorial text-2xl font-medium text-ink">
            Administrator access required
          </h2>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Your current session is signed in as a <strong className="text-ink">Reviewer</strong>. Running benchmark tests, resetting datasets, and managing system rules require Administrator privileges.
          </p>
          <div className="pt-2">
            <a
              href="/app/queue"
              className="inline-block px-4 py-2 bg-ink text-canvas text-xs font-medium rounded-xs hover:bg-ink/90 transition-colors"
            >
              Return to Review Queue
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
