import axios from 'axios';

/**
 * Cliente HTTP Axios base para comunicación con la API del backend NOC.
 * Se inicializa limpio y listo para extenderse con interceptores durante el desarrollo.
 */
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
