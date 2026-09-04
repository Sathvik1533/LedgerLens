import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser } from "../types/api";
import { fetchCurrentUser, loginUser, loginDemoUser, logoutUser } from "../api/client";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: (role?: "reviewer" | "admin") => Promise<void>;
  logout: () => Promise<void>;
  showOnboarding: boolean;
  dismissOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return sessionStorage.getItem("ledgerlens_onboarding_dismissed") !== "true";
  });

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const currentUser = await fetchCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const auth = await loginUser(email, pass);
      setUser(auth);
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (role: "reviewer" | "admin" = "reviewer") => {
    setError(null);
    setIsLoading(true);
    try {
      const auth = await loginDemoUser(role);
      setUser(auth);
    } catch (err: any) {
      setError(err?.message || "Unable to access demo account. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Proceed with client logout even if backend failed
    }
    setUser(null);
  };

  const dismissOnboarding = () => {
    sessionStorage.setItem("ledgerlens_onboarding_dismissed", "true");
    setShowOnboarding(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        loginDemo,
        logout,
        showOnboarding,
        dismissOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
