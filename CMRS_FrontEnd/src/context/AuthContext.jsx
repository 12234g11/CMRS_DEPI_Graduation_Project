import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  clearAuthData,
  getAccessToken,
  getStoredUser,
  setAuthData,
} from '../features/auth/services/authStorage';
import { logoutUser } from '../features/auth/api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(getAccessToken() && getStoredUser());
  });

  const login = useCallback(({ token, userData }) => {
    setAuthData({
      token,
      user: userData,
    });

    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const clearSession = useCallback(() => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getAccessToken()) {
        await logoutUser();
      }
    } catch {
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      logout,
      clearSession,
    }),
    [user, isAuthenticated, login, logout, clearSession]
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