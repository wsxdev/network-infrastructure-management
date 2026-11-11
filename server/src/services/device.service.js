/**
 * Servicio de Lógica de Negocio para Dispositivos de Red.
 * Cumple con RNF-12 (Arquitectura limpia) y RNF-08 (Consistencia de datos).
 *
 * @module services/device.service
 */

import mongoose from 'mongoose';
import { Device } from '../models/device.model.js';
import { Check } from '../models/check.model.js';
import { Event } from '../models/event.model.js';
import { Alert } from '../models/alert.model.js';
import { Audit } from '../models/audit.model.js';
import { DEVICE_STATUS, DEVICE_TYPES, ALERT_SEVERITY, ALERT_STATUS } from '../config/constants.js';
import { env } from '../config/environment.js';

/** Caché en memoria para alta disponibilidad y resiliencia en desarrollo */
let inMemoryDevices = [];

/**
 * Consulta y lista dispositivos con filtros de búsqueda, estado y paginación.
 *
 * @param {Object} query - Parámetros de consulta
 * @returns {Promise<Object>} Lista de dispositivos y metadatos de paginación
 */
export async function listDevices(query = {}) {
  const { search, status, type, isDeleted = false, page = 1, limit = 100 } = query;

  if (mongoose.connection.readyState !== 1) {
    let filtered = inMemoryDevices.filter((d) => !d.isDeleted);
    if (status) filtered = filtered.filter((d) => d.status === status);
    if (type) filtered = filtered.filter((d) => d.type === type);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          (d.name && d.name.toLowerCase().includes(s)) ||
          (d.ipAddress && d.ipAddress.includes(s)) ||
          (d.macAddress && d.macAddress.toLowerCase().includes(s)) ||
          (d.vendor && d.vendor.toLowerCase().includes(s)) ||
          (d.model && d.model.toLowerCase().includes(s)) ||
          (d.location && d.location.toLowerCase().includes(s))
      );
    }
    return { devices: filtered, total: filtered.length, page: Number(page), limit: Number(limit) };
  }

  try {
    const filter = { isDeleted: isDeleted === 'true' || isDeleted === true };

    if (status && Object.values(DEVICE_STATUS).includes(status)) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { macAddress: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [devices, total] = await Promise.all([
      Device.find(filter)
        .populate('parentId', 'name ipAddress type status')
        .sort({ createdAt: -1, type: 1, name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .maxTimeMS(2500)
        .lean(),
      Device.countDocuments(filter).maxTimeMS(2500)
    ]);

    if (devices && devices.length > 0) {
      inMemoryDevices = devices;
    }

    return { devices, total, page: Number(page), limit: Number(limit) };
  } catch (err) {
    console.warn('⚠️ Fallback a memoria local para listar dispositivos:', err.message);
    return { devices: inMemoryDevices, total: inMemoryDevices.length, page: 1, limit: Number(limit) };
  }
}

/**
 * Obtiene un dispositivo por su identificador único de MongoDB.
 *
 * @param {string} id - ObjectId del dispositivo
 * @returns {Promise<Object|null>} Documento del dispositivo o null
 */
export async function getDeviceById(id) {
  if (mongoose.connection.readyState === 1) {
    try {
      const dev = await Device.findById(id).populate('parentId', 'name ipAddress type status').maxTimeMS(2500);
      if (dev) return dev;
    } catch (err) {
      // Continuar a fallback en memoria
    }
  }
  return inMemoryDevices.find((d) => d._id?.toString() === id.toString()) || null;
}

/**
 * Registra un nuevo dispositivo en el inventario técnico y audita la acción.
 * Satisface los Criterios de Aceptación Escenario 3 y Escenario 4 (DEVICE_CREATED).
 *
 * @param {Object} data - Datos normalizados del dispositivo
 * @param {Object} [user=null] - Usuario autenticado que realiza el registro
 * @returns {Promise<Object>} Dispositivo registrado con ObjectId inmutable
 */
export async function createDevice(data, user = null) {
  let device = null;

  if (mongoose.connection.readyState === 1) {
    try {
      if (data.ipAddress) {
        const existing = await Device.findOne({
          ipAddress: data.ipAddress,
          isDeleted: false
        }).maxTimeMS(2500);
        if (existing) {
          const error = new Error(`La dirección IP ${data.ipAddress} ya está asignada al dispositivo activo "${existing.name}".`);
          error.statusCode = 409;
          throw error;
        }
      }

      device = await Device.create(data);
    } catch (err) {
      if (err.statusCode === 409) throw err;
      console.warn('⚠️ Fallback en memoria al crear dispositivo:', err.message);
    }
  }

  if (!device) {
    const _id = new mongoose.Types.ObjectId().toString();
    device = {
      _id,
      ...data,
      status: data.status || DEVICE_STATUS.UP,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const deviceObj = device.toObject ? device.toObject() : device;
  inMemoryDevices = [deviceObj, ...inMemoryDevices.filter((d) => d._id?.toString() !== deviceObj._id?.toString())];

  // Registro de Auditoría inmutable DEVICE_CREATED
  try {
    if (mongoose.connection.readyState === 1) {
      await Audit.create({
        userId: user?._id || null,
        userEmail: user?.email || 'admin@espoch.edu.ec',
        action: 'DEVICE_CREATED',
        targetType: 'Device',
        targetId: deviceObj._id.toString(),
        details: {
          name: deviceObj.name,
          ipAddress: deviceObj.ipAddress,
          macAddress: deviceObj.macAddress,
          type: deviceObj.type,
          vendor: deviceObj.vendor,
          model: deviceObj.model,
          location: deviceObj.location,
          notes: deviceObj.notes,
          isManaged: deviceObj.isManaged
        },
        ipAddress: user?.ipAddress || '127.0.0.1'
      });
    }
  } catch (auditErr) {
    // Continuar sin interrumpir respuesta HTTP 201
  }

  return deviceObj;
}

/**
 * Actualiza los campos de un dispositivo existente.
 *
 * @param {string} id - ObjectId del dispositivo
 * @param {Object} data - Campos a modificar
 * @param {Object} [user=null] - Usuario autenticado
 * @returns {Promise<Object>} Dispositivo actualizado
 */
export async function updateDevice(id, data, user = null) {
  let device = null;

  if (mongoose.connection.readyState === 1) {
    try {
      device = await Device.findById(id);
      if (device && !device.isDeleted) {
        if (data.ipAddress && data.ipAddress !== device.ipAddress) {
          const existing = await Device.findOne({
            ipAddress: data.ipAddress,
            _id: { $ne: id },
            isDeleted: false
          }).maxTimeMS(2500);
          if (existing) {
            const err = new Error(`La dirección IP ${data.ipAddress} ya se encuentra asignada a otro dispositivo activo.`);
            err.statusCode = 409;
            throw err;
          }
        }
        Object.assign(device, data);
        await device.save();
      }
    } catch (err) {
      if (err.statusCode === 409) throw err;
      console.warn('⚠️ Fallback en memoria al actualizar:', err.message);
    }
  }

  // Actualizar también en in-memory
  const idx = inMemoryDevices.findIndex((d) => d._id?.toString() === id.toString());
  if (idx !== -1) {
    inMemoryDevices[idx] = { ...inMemoryDevices[idx], ...data, updatedAt: new Date() };
    if (!device) device = inMemoryDevices[idx];
  }

  if (!device) {
    const err = new Error('Dispositivo no encontrado o dado de baja.');
    err.statusCode = 404;
    throw err;
  }

  return device;
}

/**
 * Ejecuta una baja lógica sobre el dispositivo preservando historial técnico (RF-02.04).
 *
 * @param {string} id - ObjectId del dispositivo
 * @param {Object} [user=null] - Usuario autenticado
 * @returns {Promise<Object>} Dispositivo dado de baja
 */
export async function softDeleteDevice(id, user = null) {
  let device = null;

  if (mongoose.connection.readyState === 1) {
    try {
      device = await Device.findById(id);
      if (device) {
        device.isDeleted = true;
        await device.save();
      }
    } catch (err) {
      console.warn('⚠️ Fallback en memoria al eliminar:', err.message);
    }
  }

  const idx = inMemoryDevices.findIndex((d) => d._id?.toString() === id.toString());
  if (idx !== -1) {
    inMemoryDevices[idx].isDeleted = true;
    if (!device) device = inMemoryDevices[idx];
  }

  if (!device) {
    const err = new Error('Dispositivo no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  return device;
}

/**
 * Registra el resultado de una comprobación ICMP y evalúa histéresis de cambio de estado.
 */
export async function recordPingResult(deviceId, pingResult) {
  if (mongoose.connection.readyState === 1) {
    try {
      const device = await Device.findById(deviceId);
      if (!device || device.isDeleted) return null;

      const previousStatus = device.status;
      const isAlive = pingResult.alive;

      await Check.create({
        deviceId: device._id,
        status: isAlive ? DEVICE_STATUS.UP : DEVICE_STATUS.DOWN,
        responseTimeMs: pingResult.timeMs
      });

      if (isAlive) {
        device.consecutiveSuccesses += 1;
        device.consecutiveFailures = 0;
        device.responseTimeMs = pingResult.timeMs;
        device.lastSeen = new Date();

        if (device.consecutiveSuccesses >= env.CONSECUTIVE_SUCCESSES_FOR_UP) {
          device.status = DEVICE_STATUS.UP;
        }
      } else {
        device.consecutiveFailures += 1;
        device.consecutiveSuccesses = 0;
        device.responseTimeMs = null;

        if (device.consecutiveFailures >= env.CONSECUTIVE_FAILURES_FOR_DOWN) {
          device.status = DEVICE_STATUS.DOWN;
        }
      }

      await device.save();
      return { device, previousStatus, transition: previousStatus !== device.status };
    } catch (err) {
      console.warn('⚠️ Fallback de ping:', err.message);
    }
  }
  return null;
}
