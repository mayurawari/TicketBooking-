"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthResponse } from "@/lib/types";
import { api, setStoredToken, getStoredToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const data = await api.get<{ message: string; user: User }>("/auth/me");
        if (isMounted && data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setStoredToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/login", { email, password });
      if (res.token) {
        setStoredToken(res.token);
      }
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
      if (res.token) {
        setStoredToken(res.token);
      }
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.delete("/auth/logout");
    } catch {
      // Even if server call fails, clear local state
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async (): Promise<User | null> => {
    try {
      const data = await api.get<{ user: User }>("/auth/me");
      if (data?.user) {
        setUser(data.user);
        return data.user;
      }
      return null;
    } catch {
      setUser(null);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        logout,
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

