/**
 * Servicio de Lógica de Negocio para Dispositivos de Red.
 * Cumple con RNF-12 (Arquitectura limpia) y RNF-08 (Consistencia de datos).
 *
 * @module services/device.service
 */

import { Device } from '../models/device.model.js';
import { Check } from '../models/check.model.js';
import { Event } from '../models/event.model.js';
import { Alert } from '../models/alert.model.js';
import { Audit } from '../models/audit.model.js';
import { DEVICE_STATUS, DEVICE_TYPES, ALERT_SEVERITY, ALERT_STATUS } from '../config/constants.js';
import { env } from '../config/environment.js';

/**
 * Consulta y lista dispositivos con filtros de búsqueda, estado y paginación.
 *
 * @param {Object} query - Parámetros de consulta
 * @returns {Promise<Object>} Lista de dispositivos y metadatos de paginación
 */
export async function listDevices(query = {}) {
  const { search, status, type, isDeleted = false, page = 1, limit = 100 } = query;

  const filter = { isDeleted: isDeleted === 'true' || isDeleted === true };

  if (status && Object.values(DEVICE_STATUS).includes(status)) {
    filter.status = status;
  }

  if (type && Object.values(DEVICE_TYPES).includes(type)) {
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
      .sort({ type: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Device.countDocuments(filter)
  ]);

  return { devices, total, page: Number(page), limit: Number(limit) };
}

/**
 * Obtiene un dispositivo por su identificador único de MongoDB.
 *
 * @param {string} id - ObjectId del dispositivo
 * @returns {Promise<Object|null>} Documento del dispositivo o null
 */
export async function getDeviceById(id) {
  return Device.findById(id).populate('parentId', 'name ipAddress type status');
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
  // Verificar duplicidad de IP en dispositivos activos (RF-02)
  if (data.ipAddress) {
    const existing = await Device.findOne({
      ipAddress: data.ipAddress,
      isDeleted: false
    });
    if (existing) {
      const error = new Error(`La dirección IP ${data.ipAddress} ya está asignada al dispositivo activo "${existing.name}".`);
      error.statusCode = 409;
      throw error;
    }
  }

  // Persistir en MongoDB: se autogenera _id único e inmutable
  const device = await Device.create(data);

  // Registro de Auditoría inmutable DEVICE_CREATED
  await Audit.create({
    userId: user?._id || null,
    userEmail: user?.email || 'admin@espoch.edu.ec',
    action: 'DEVICE_CREATED',
    targetType: 'Device',
    targetId: device._id.toString(),
    details: {
      name: device.name,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      type: device.type,
      vendor: device.vendor,
      model: device.model,
      location: device.location,
      notes: device.notes,
      isManaged: device.isManaged
    },
    ipAddress: user?.ipAddress || '127.0.0.1'
  });

  return device;
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
  const device = await Device.findById(id);
  if (!device || device.isDeleted) {
    const err = new Error('Dispositivo no encontrado o dado de baja.');
    err.statusCode = 404;
    throw err;
  }

  // Prevenir conflicto de IP con otros dispositivos activos
  if (data.ipAddress && data.ipAddress !== device.ipAddress) {
    const existing = await Device.findOne({
      ipAddress: data.ipAddress,
      _id: { $ne: id },
      isDeleted: false
    });
    if (existing) {
      const err = new Error(`La dirección IP ${data.ipAddress} ya se encuentra asignada a otro dispositivo activo.`);
      err.statusCode = 409;
      throw err;
    }
  }

  Object.assign(device, data);
  await device.save();

  if (user) {
    await Audit.create({
      userId: user._id,
      userEmail: user.email,
      action: 'DEVICE_UPDATE',
      targetType: 'Device',
      targetId: device._id.toString(),
      details: data
    });
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
  const device = await Device.findById(id);
  if (!device) {
    const err = new Error('Dispositivo no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  device.isDeleted = true;
  await device.save();

  if (user) {
    await Audit.create({
      userId: user._id,
      userEmail: user.email,
      action: 'DEVICE_DELETE_LOGICAL',
      targetType: 'Device',
      targetId: device._id.toString(),
      details: { name: device.name, ip: device.ipAddress }
    });
  }

  return device;
}

/**
 * Registra el resultado de una comprobación ICMP y evalúa histéresis de cambio de estado.
 *
 * @param {string} deviceId - ObjectId del dispositivo
 * @param {Object} pingResult - Resultado de la sonda ICMP
 * @returns {Promise<Object|null>} Dispositivo y estado de transición
 */
export async function recordPingResult(deviceId, pingResult) {
  const device = await Device.findById(deviceId);
  if (!device || device.isDeleted) return null;

  const previousStatus = device.status;
  const { isAlive, responseTimeMs, errorMessage } = pingResult;

  // 1. Guardar comprobación bruta (Índice TTL 30 días)
  await Check.create({
    deviceId: device._id,
    ipAddress: device.ipAddress || '0.0.0.0',
    status: isAlive ? DEVICE_STATUS.UP : DEVICE_STATUS.DOWN,
    responseTimeMs: isAlive ? responseTimeMs : null,
    isSuccess: isAlive,
    errorMessage: isAlive ? null : errorMessage
  });

  device.lastChecked = new Date();
  if (isAlive) {
    device.lastSeen = new Date();
    device.responseTimeMs = responseTimeMs;
  }

  let statusChanged = false;
  let newStatus = previousStatus;

  if (isAlive) {
    device.consecutiveSuccesses += 1;
    device.consecutiveFailures = 0;

    // Si alcanza el umbral de éxitos y no estaba UP, pasa a UP
    if (device.consecutiveSuccesses >= env.CONSECUTIVE_SUCCESSES_FOR_UP && previousStatus !== DEVICE_STATUS.UP) {
      newStatus = DEVICE_STATUS.UP;
      statusChanged = true;
      device.status = DEVICE_STATUS.UP;
    }
  } else {
    device.consecutiveFailures += 1;
    device.consecutiveSuccesses = 0;

    // Si alcanza el umbral de fallos consecutivos y estaba UP, pasa a DOWN
    if (device.consecutiveFailures >= env.CONSECUTIVE_FAILURES_FOR_DOWN && previousStatus === DEVICE_STATUS.UP) {
      newStatus = DEVICE_STATUS.DOWN;
      statusChanged = true;
      device.status = DEVICE_STATUS.DOWN;
    }
  }

  await device.save();

  // 2. Si hubo transición de estado, registrar Evento y evaluar Alerta
  if (statusChanged) {
    await Event.create({
      deviceId: device._id,
      previousStatus,
      newStatus,
      responseTimeMs: isAlive ? responseTimeMs : null,
      reason: isAlive
        ? `Reestablecimiento de conectividad tras ${device.consecutiveSuccesses} respuestas exitosas.`
        : `Pérdida de conectividad tras ${device.consecutiveFailures} comprobaciones fallidas.`
    });

    if (newStatus === DEVICE_STATUS.DOWN) {
      const isCritical = [DEVICE_TYPES.ROUTER, DEVICE_TYPES.SWITCH, DEVICE_TYPES.SERVER].includes(device.type);
      const severity = isCritical ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.WARNING;

      await Alert.create({
        deviceId: device._id,
        title: `Caída detectada: ${device.name}`,
        message: `El dispositivo ${device.name} (${device.ipAddress}) no responde a solicitudes ICMP.`,
        severity,
        status: ALERT_STATUS.OPEN
      });
    } else if (newStatus === DEVICE_STATUS.UP) {
      await Alert.updateMany(
        { deviceId: device._id, status: ALERT_STATUS.OPEN },
        { status: ALERT_STATUS.RESOLVED, resolvedAt: new Date() }
      );
    }
  }

  return { device, previousStatus, newStatus, statusChanged };
}
