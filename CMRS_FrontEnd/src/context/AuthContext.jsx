import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuthData, getStoredUser, setAuthData, getAccessToken } from '../features/auth/services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());

  useEffect(() => {
    const storedUser = getStoredUser();
    const hasToken = !!getAccessToken();

    setUser(storedUser);
    setIsAuthenticated(hasToken);
  }, []);

  const login = ({ token, userData }) => {
    setAuthData({ token, user: userData });
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}