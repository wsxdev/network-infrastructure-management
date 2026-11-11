import { z } from 'zod';
import { USER_ROLES } from '../config/constants.js';

export const loginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe contener al menos 6 caracteres')
});

export const registerUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe contener al menos 8 caracteres'),
  role: z.enum([USER_ROLES.ADMINISTRATOR, USER_ROLES.OPERATOR]).default(USER_ROLES.OPERATOR)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
});
