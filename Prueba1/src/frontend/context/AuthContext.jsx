import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  authenticateLocalUser,
  ensureDemoUser,
  getStoredSession,
  clearStoredSession,
  registerLocalUser
} from '../../backend/services/localUserStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ensureDemoUser();
    const session = getStoredSession();
    if (session?.user && session?.token) {
      setUser(session.user);
      setToken(session.token);
    }
    setIsLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const session = authenticateLocalUser({ email, password });
    setUser(session.user);
    setToken(session.token);
    return session;
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
    setToken(null);
  };

  const register = async ({ name, email, password }) => {
    registerLocalUser({ name, email, password });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      register
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
};