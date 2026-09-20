"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CustomerProfile {
  id: string;
  customerCode: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  customerType?: string;
}

interface AuthContextType {
  customer: CustomerProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const refreshProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
          try {
            localStorage.setItem("printxo_customer_profile", JSON.stringify(data.customer));
          } catch (e) {}
        } else {
          setCustomer(null);
          try {
            localStorage.removeItem("printxo_customer_profile");
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("Auth check failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        try {
          localStorage.setItem("printxo_customer_profile", JSON.stringify(data.customer));
        } catch (e) {}
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        try {
          localStorage.setItem("printxo_customer_profile", JSON.stringify(data.customer));
        } catch (e) {}
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    setCustomer(null);
    try {
      localStorage.removeItem("printxo_customer_profile");
    } catch (e) {}
  };

  const updateProfile = async (data: Partial<CustomerProfile>) => {
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCustomer(result.customer);
        try {
          localStorage.setItem("printxo_customer_profile", JSON.stringify(result.customer));
        } catch (e) {}
        return { success: true };
      }
      return { success: false, error: result.error || "Failed to update profile" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
        setAuthMode,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
