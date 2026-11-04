import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { User } from '../models/user.model.js';

/**
 * Middleware para validar el Access Token JWT proveniente del encabezado Authorization o cookie.
 * Cumple con RNF-05 y RNF-06.
 */
export async function authenticate(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: Token de autenticación ausente.'
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido o deshabilitado en el sistema.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'El token de acceso ha expirado. Proceda a renovarlo.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token de autenticación no válido.'
    });
  }
}
