'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');

    if (storedToken) {
      setToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
  };

  const value: AuthContextType = {
    user: null,
    token,
    login: async () => {}, // This will be overridden by the mutation
    logout,
    isAuthenticated: !!token,
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
