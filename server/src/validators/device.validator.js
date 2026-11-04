import { z } from 'zod';
import { DEVICE_TYPES } from '../config/constants.js';

const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identificador no válido (debe ser un ObjectId de 24 caracteres hex)')
});

export const createDeviceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  ipAddress: z.string().regex(ipv4Regex, 'Dirección IPv4 no válida').optional().nullable(),
  macAddress: z.string().regex(macRegex, 'Dirección MAC no válida (formato XX:XX:XX:XX:XX:XX)').optional().nullable(),
  type: z.enum(Object.values(DEVICE_TYPES)),
  location: z.string().max(150).optional().default('Laboratorio de Telecomunicaciones'),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
  isManaged: z.boolean().optional().default(true),
  customMetadata: z.record(z.string()).optional()
}).refine(data => {
  // Si no es un switch no administrable, la IP es obligatoria
  if (data.isManaged !== false && (!data.ipAddress || data.ipAddress.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'La dirección IP es obligatoria para dispositivos administrables.',
  path: ['ipAddress']
});

export const updateDeviceSchema = createDeviceSchema.partial();
