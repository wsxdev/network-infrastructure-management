/**
 * Middleware para validar que el usuario autenticado posea uno de los roles autorizados.
 * Cumple con RNF-06 (Control de acceso y protección de operaciones en el servidor).
 *
 * @param {Array<string>} allowedRoles - Lista de roles permitidos ('administrador', 'operador')
 * @returns {Function} Middleware Express
 */
export function authorizeRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autenticado.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso restringido: Se requiere uno de los roles [${allowedRoles.join(', ')}]. Su rol actual es '${req.user.role}'.`
      });
    }

    next();
  };
}
