import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de Petición: Inyectar Access Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('espoch_noc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Renovación Automática de Token ante 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no hay configuración de la petición o ya fue reintentada, rechazar
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // No interceptar ni reintentar llamadas de autenticación para evitar bucles de recarga
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    const currentToken = localStorage.getItem('espoch_noc_token');

    // Si es 401 y teníamos una sesión previa con token, intentar refresh token
    if (error.response?.status === 401 && currentToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = data.data.accessToken;

        localStorage.setItem('espoch_noc_token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('espoch_noc_token');
        localStorage.removeItem('espoch_noc_user');

        // Solo redirigir si no estamos ya en la página de login para evitar bucles infinitos de recarga
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
