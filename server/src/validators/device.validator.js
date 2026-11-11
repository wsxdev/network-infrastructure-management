import net from 'node:net';
import { z } from 'zod';
import { DEVICE_TYPES } from '../config/constants.js';

const emptyToNull = (value) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const ipAddressSchema = z.preprocess(
  emptyToNull,
  z
    .string({ invalid_type_error: 'La dirección IP debe ser texto.' })
    .trim()
    .refine((value) => net.isIP(value) !== 0, {
      message: 'La dirección IP no es válida (IPv4 o IPv6).'
    })
    .nullable()
    .optional()
);

const macAddressSchema = z.preprocess(
  emptyToNull,
  z
    .string({ invalid_type_error: 'La dirección MAC debe ser texto.' })
    .trim()
    .regex(/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i, {
      message: 'La dirección MAC no es válida (formato AA:BB:CC:DD:EE:FF).'
    })
    .nullable()
    .optional()
);

export const createDeviceSchema = z
  .object({
    name: z
      .string({ required_error: 'El nombre es obligatorio.' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres.')
      .max(120, 'El nombre no puede superar los 120 caracteres.'),
    type: z.enum(Object.values(DEVICE_TYPES), {
      errorMap: () => ({ message: 'El tipo de dispositivo no es válido.' })
    }),
    // RF-03.08: IP opcional para switches no administrables.
    ipAddress: ipAddressSchema,
    macAddress: macAddressSchema,
    brand: z.string().trim().max(80).optional(),
    model: z.string().trim().max(80).optional(),
    location: z.string().trim().max(200).optional()
  })
  .strict();
