import { asyncHandler } from '../middlewares/async-handler.js';
import * as authService from '../services/auth.service.js';
import { User } from '../models/user.model.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

  const { user, accessToken, refreshToken } = await authService.loginUser(email, password, clientIp);

  // Almacenar Refresh Token en cookie HttpOnly segura (RNF-05 y RNF-07)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  });

  return res.status(200).json({
    success: true,
    message: 'Autenticación exitosa.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    }
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token no proporcionado.'
    });
  }

  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshUserToken(token);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    }
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada correctamente.'
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña actual no es correcta.'
    });
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Contraseña actualizada satisfactoriamente.'
  });
});
