import { env } from '../config/environment.js';

/**
 * Middleware centralizado de tratamiento de errores.
 * Captura excepciones no controladas y devuelve respuestas homogéneas en JSON.
 */
export function errorHandler(err, req, res, next) {
  console.error('🚨 Excepción capturada en middleware central:', err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
