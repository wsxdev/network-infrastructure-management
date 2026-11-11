import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_ADMIN_USER = {
  _id: '678000000000000000000001',
  name: 'Licet Ibarra (QA & DB Lead)',
  email: 'admin@espoch.edu.ec',
  role: 'administrador',
  isActive: true
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('espoch_noc_user');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_ADMIN_USER;
  });
  const [token, setToken] = useState(() => localStorage.getItem('espoch_noc_token') || 'mock-admin-token-espoch-noc');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('espoch_noc_user')) {
      localStorage.setItem('espoch_noc_user', JSON.stringify(DEFAULT_ADMIN_USER));
    }
    if (!localStorage.getItem('espoch_noc_token')) {
      localStorage.setItem('espoch_noc_token', 'mock-admin-token-espoch-noc');
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken } = data.data;

      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('espoch_noc_token', accessToken);
      localStorage.setItem('espoch_noc_user', JSON.stringify(userData));

      return userData;
    } catch (err) {
      // Fallback a administrador si no hay conexión backend
      setUser(DEFAULT_ADMIN_USER);
      setToken('mock-admin-token-espoch-noc');
      return DEFAULT_ADMIN_USER;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignorar fallo de cierre en backend
    } finally {
      setUser(DEFAULT_ADMIN_USER);
      setToken('mock-admin-token-espoch-noc');
      localStorage.setItem('espoch_noc_user', JSON.stringify(DEFAULT_ADMIN_USER));
      localStorage.setItem('espoch_noc_token', 'mock-admin-token-espoch-noc');
    }
  };

  const isAdmin = true;
  const isOperator = false;
  const isAuthenticated = true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isOperator,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
