import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ManagerProfile } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  manager: ManagerProfile | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_MANAGER: ManagerProfile = {
  name: 'Rajesh Nair',
  email: 'manager@hysense.com',
  role: 'Chief Safety Manager',
  department: 'H₂S Industrial Operations',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

const AUTH_KEY = 'hysense_manager_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [manager, setManager] = useState<ManagerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check saved session
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setManager(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setError(null);

    // Basic format validations
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!pass || pass.length < 4) {
      setError('Password must be at least 4 characters long.');
      return false;
    }

    // Simulate network API delay
    await new Promise(res => setTimeout(res, 800));

    // Allow default login for any valid email/password combination or demo credentials
    if (email === 'invalid@hysense.com') {
      setError('Invalid manager credentials. Access denied.');
      return false;
    }

    const userProfile: ManagerProfile = {
      ...DEMO_MANAGER,
      email: email,
      name: email.split('@')[0].replace('.', ' ').toUpperCase() || DEMO_MANAGER.name
    };

    // Update state BEFORE saving to localStorage to ensure immediate UI response
    setManager(userProfile);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, JSON.stringify(userProfile));
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setManager(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, manager, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
