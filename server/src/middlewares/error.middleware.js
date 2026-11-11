import { env } from "../config/environment.js";

/**
 * Middleware centralizado de tratamiento de errores.
 * Captura excepciones no controladas y devuelve respuestas homogéneas en JSON.
 */
export function errorHandler(err, req, res, next) {
  console.error("[ERROR] Excepcion capturada en middleware central:", err);

  const statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const isDeviceConflict =
    statusCode === 409 &&
    (err.code === "DUPLICATE_IP" || err.code === "DUPLICATE_MAC") &&
    err.conflicts;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Error interno del servidor.",
    code: err.code || "INTERNAL_SERVER_ERROR",
    ...(isDeviceConflict && { field: err.field, data: err.conflicts }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
