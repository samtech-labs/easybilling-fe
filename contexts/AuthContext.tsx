'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT token
const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount and decode role
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');

    if (storedToken) {
      setToken(storedToken);
      const decoded = decodeToken(storedToken);
      if (decoded && decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
        setUserRole(decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
      }
    }

    setIsLoading(false);
  }, []);

  const setAuthToken = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    const decoded = decodeToken(newToken);
    if (decoded && decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
      setUserRole(decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUserRole(null);
  };

  const value: AuthContextType = {
    user: null,
    token,
    login: async () => {}, // This will be handled by useLogin hook
    logout,
    isAuthenticated: !!token && !isLoading,
    setAuthToken,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
