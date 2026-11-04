import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { User } from '../models/user.model.js';
import { Audit } from '../models/audit.model.js';

export function signAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

export async function loginUser(email, password, clientIp = '127.0.0.1') {
  const user = await User.findOne({ email });

  if (!user || !user.isActive) {
    throw new Error('Credenciales inválidas o cuenta inactiva.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas.');
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // Registro de auditoría
  await Audit.create({
    userId: user._id,
    userEmail: user.email,
    action: 'USER_LOGIN',
    targetType: 'User',
    targetId: user._id.toString(),
    ipAddress: clientIp,
    details: { timestamp: new Date() }
  });

  return { user, accessToken, refreshToken };
}

export async function refreshUserToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new Error('Usuario no válido para renovación.');
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new Error('Refresh token inválido o expirado.');
  }
}
