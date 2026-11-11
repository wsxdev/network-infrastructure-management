/**
 * Envoltorio de funciones asíncronas para canalizar excepciones hacia el middleware central de errores.
 * Evita bloques try-catch redundantes en cada controlador (Fábrica de Precisión).
 *
 * @param {Function} fn - Función asíncrona del controlador Express (req, res, next)
 * @returns {Function} Middleware Express protegido
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
