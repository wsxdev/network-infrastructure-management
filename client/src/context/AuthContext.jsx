import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('espoch_noc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('espoch_noc_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.data);
          localStorage.setItem('espoch_noc_user', JSON.stringify(data.data));
        } catch (err) {
          console.error('Error al verificar sesión existente:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken } = data.data;

    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('espoch_noc_token', accessToken);
    localStorage.setItem('espoch_noc_user', JSON.stringify(userData));

    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignorar fallo de cierre en backend
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('espoch_noc_token');
      localStorage.removeItem('espoch_noc_user');
    }
  };

  const isAdmin = user?.role === 'administrador';
  const isOperator = user?.role === 'operador';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isOperator,
        isLoading,
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
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
}
