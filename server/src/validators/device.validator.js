/**
 * Esquemas de validación Zod para operaciones de inventario de dispositivos.
 * Cumple con ISO/IEC 27001, RNF-08 (Validación defensiva) y RNF-12 (Modularidad).
 *
 * @module validators/device.validator
 */

import { z } from 'zod';
import { DEVICE_TYPES } from '../config/constants.js';

/** Tipos de dispositivos admitidos en el inventario (catálogo canónico + enum del sistema) */
export const ADMITTED_DEVICE_TYPES = Array.from(new Set([
  ...Object.values(DEVICE_TYPES),
  'desktop',
  'laptop',
  'server',
  'router',
  'switch_managed',
  'switch_unmanaged',
  'access_point',
  'network_printer',
  'smartphone',
  'other'
]));

/**
 * Expresión regular estricta para direcciones IPv4 en notación decimal con puntos (RFC 791).
 * Valida 4 octetos con rango [0-255] cada uno.
 */
export const IPV4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/**
 * Expresión regular para direcciones MAC admitidas (separadores ':' o '-' o '.').
 */
export const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4})$/;

/**
 * Normaliza y estandariza una dirección MAC al formato canónico XX:XX:XX:XX:XX:XX en mayúsculas.
 *
 * @param {string|null|undefined} rawMac - Dirección MAC en cualquier formato admitido
 * @returns {string|null} Dirección MAC normalizada o null si está vacía
 */
export function normalizeMacAddress(rawMac) {
  if (!rawMac || typeof rawMac !== 'string') return null;
  const trimmed = rawMac.trim();
  if (trimmed === '') return null;

  // Extraer dígitos hexadecimales
  const hexOnly = trimmed.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  if (hexOnly.length !== 12) {
    return trimmed.toUpperCase(); // Retorna para que falle la regex del validador si no tiene 12 hex
  }

  // Agrupar en pares separados por ':'
  return hexOnly.match(/.{1,2}/g).join(':');
}

/**
 * Normaliza una dirección IPv4 eliminando espacios en blanco innecesarios.
 *
 * @param {string|null|undefined} rawIp - Dirección IP enviada
 * @returns {string|null} Dirección IP limpia o null
 */
export function normalizeIpAddress(rawIp) {
  if (!rawIp || typeof rawIp !== 'string') return null;
  const trimmed = rawIp.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Validador para parámetro ObjectId en rutas.
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identificador no válido (debe ser un ObjectId de 24 caracteres hex)')
});

/**
 * Esquema Zod de validación y normalización para el registro de nuevos dispositivos.
 * Satisface los Criterios de Aceptación Escenario 1 y 2.
 */
export const createDeviceSchema = z
  .object({
    name: z
      .string({ required_error: 'El nombre del dispositivo es obligatorio.' })
      .trim()
      .min(1, 'El nombre no puede estar vacío.')
      .max(120, 'El nombre no puede exceder 120 caracteres.'),

    type: z
      .string({ required_error: 'El tipo de dispositivo es obligatorio.' })
      .trim()
      .refine(val => ADMITTED_DEVICE_TYPES.includes(val), {
        message: 'Tipo de dispositivo no válido en el catálogo del sistema.'
      }),

    ipAddress: z
      .string()
      .nullable()
      .optional()
      .transform(normalizeIpAddress)
      .refine(
        val => val === null || val === undefined || IPV4_REGEX.test(val),
        { message: 'Dirección IPv4 en formato decimal punteado no admitido (ej. 192.168.1.50).' }
      ),

    macAddress: z
      .string()
      .nullable()
      .optional()
      .transform(normalizeMacAddress)
      .refine(
        val => val === null || val === undefined || /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(val),
        { message: 'Dirección MAC no válida. Formato admitido: AA:BB:CC:DD:EE:FF o aa:bb:cc:dd:ee:ff.' }
      ),

    vendor: z.string().trim().max(100).optional().default(''),
    fabricante: z.string().trim().max(100).optional(),

    model: z.string().trim().max(100).optional().default(''),
    modelo: z.string().trim().max(100).optional(),

    location: z
      .string()
      .trim()
      .max(150)
      .optional()
      .default('Laboratorio 1 - Rack A'),
    ubicacion: z.string().trim().max(150).optional(),

    notes: z.string().trim().max(500).optional().default(''),
    observaciones: z.string().trim().max(500).optional(),

    parentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'El identificador del dispositivo padre debe ser un ObjectId válido.')
      .nullable()
      .optional(),

    isManaged: z.boolean().optional().default(true),
    customMetadata: z.record(z.string()).optional()
  })
  .transform(data => {
    // Unificación de sinónimos en español hacia nombres estándar
    return {
      ...data,
      vendor: (data.fabricante !== undefined && data.fabricante.trim() !== '') ? data.fabricante.trim() : (data.vendor || ''),
      model: (data.modelo !== undefined && data.modelo.trim() !== '') ? data.modelo.trim() : (data.model || ''),
      location: (data.ubicacion !== undefined && data.ubicacion.trim() !== '') ? data.ubicacion.trim() : (data.location || 'Laboratorio 1 - Rack A'),
      notes: (data.observaciones !== undefined && data.observaciones.trim() !== '') ? data.observaciones.trim() : (data.notes || '')
    };
  })
  .refine(
    data => {
      // ESCENARIO 1: La IP es obligatoria salvo que se marque explícitamente como equipo sin monitoreo directo (isManaged === false)
      if (data.isManaged !== false) {
        return !!data.ipAddress && data.ipAddress.trim() !== '';
      }
      return true;
    },
    {
      message: 'La dirección IP es obligatoria para dispositivos administrables con monitoreo directo.',
      path: ['ipAddress']
    }
  );

/**
 * Esquema para actualización parcial de dispositivos.
 */
export const updateDeviceSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre no puede estar vacío.').max(120).optional(),
    type: z
      .string()
      .trim()
      .refine(val => ADMITTED_DEVICE_TYPES.includes(val), {
        message: 'Tipo de dispositivo no válido en el catálogo del sistema.'
      })
      .optional(),
    ipAddress: z
      .string()
      .nullable()
      .optional()
      .transform(normalizeIpAddress)
      .refine(
        val => val === null || val === undefined || IPV4_REGEX.test(val),
        { message: 'Dirección IPv4 en formato decimal punteado no admitido.' }
      ),
    macAddress: z
      .string()
      .nullable()
      .optional()
      .transform(normalizeMacAddress)
      .refine(
        val => val === null || val === undefined || /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(val),
        { message: 'Dirección MAC no válida (debe cumplir formato XX:XX:XX:XX:XX:XX).' }
      ),
    vendor: z.string().trim().max(100).optional(),
    fabricante: z.string().trim().max(100).optional(),
    model: z.string().trim().max(100).optional(),
    modelo: z.string().trim().max(100).optional(),
    location: z.string().trim().max(150).optional(),
    ubicacion: z.string().trim().max(150).optional(),
    notes: z.string().trim().max(500).optional(),
    observaciones: z.string().trim().max(500).optional(),
    parentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .nullable()
      .optional(),
    isManaged: z.boolean().optional(),
    customMetadata: z.record(z.string()).optional()
  })
  .transform(data => {
    const transformed = { ...data };
    if (data.fabricante !== undefined) transformed.vendor = data.fabricante;
    if (data.modelo !== undefined) transformed.model = data.modelo;
    if (data.ubicacion !== undefined) transformed.location = data.ubicacion;
    if (data.observaciones !== undefined) transformed.notes = data.observaciones;
    return transformed;
  });
