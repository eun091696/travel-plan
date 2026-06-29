import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    const restoreUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (mounted) {
        setUser(currentUser);
        setIsCheckingAuth(false);
      }
    };

    restoreUser();

    return () => {
      mounted = false;
    };
  }, []);

  const loginAsGuest = async () => {
    setIsLoggingIn(true);
    try {
      const guestUser = await authService.loginAsGuest();
      setUser(guestUser);
      return guestUser;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isCheckingAuth,
      isLoggingIn,
      loginAsGuest,
      logout,
    }),
    [user, isCheckingAuth, isLoggingIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
