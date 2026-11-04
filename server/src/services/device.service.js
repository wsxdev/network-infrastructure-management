import { Device } from '../models/device.model.js';
import { Check } from '../models/check.model.js';
import { Event } from '../models/event.model.js';
import { Alert } from '../models/alert.model.js';
import { Audit } from '../models/audit.model.js';
import { DEVICE_STATUS, DEVICE_TYPES, ALERT_SEVERITY, ALERT_STATUS } from '../config/constants.js';
import { env } from '../config/environment.js';

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
      { location: { $regex: search, $options: 'i' } }
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

export async function getDeviceById(id) {
  return Device.findById(id).populate('parentId', 'name ipAddress type status');
}

export async function createDevice(data, user = null) {
  // Verificar duplicidad de IP en dispositivos activos (RF-02)
  if (data.ipAddress) {
    const existing = await Device.findOne({
      ipAddress: data.ipAddress,
      isDeleted: false
    });
    if (existing) {
      throw new Error(`La dirección IP ${data.ipAddress} ya está asignada al dispositivo activo "${existing.name}".`);
    }
  }

  const device = await Device.create(data);

  if (user) {
    await Audit.create({
      userId: user._id,
      userEmail: user.email,
      action: 'DEVICE_CREATE',
      targetType: 'Device',
      targetId: device._id.toString(),
      details: { name: device.name, ip: device.ipAddress, type: device.type }
    });
  }

  return device;
}

export async function updateDevice(id, data, user = null) {
  const device = await Device.findById(id);
  if (!device || device.isDeleted) {
    throw new Error('Dispositivo no encontrado o dado de baja.');
  }

  // Prevenir conflicto de IP con otros dispositivos
  if (data.ipAddress && data.ipAddress !== device.ipAddress) {
    const existing = await Device.findOne({
      ipAddress: data.ipAddress,
      _id: { $ne: id },
      isDeleted: false
    });
    if (existing) {
      throw new Error(`La dirección IP ${data.ipAddress} ya se encuentra asignada a otro dispositivo activo.`);
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

export async function softDeleteDevice(id, user = null) {
  const device = await Device.findById(id);
  if (!device) {
    throw new Error('Dispositivo no encontrado.');
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
      // Determinar severidad según criticidad del dispositivo
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
      // Resolver alertas abiertas anteriores
      await Alert.updateMany(
        { deviceId: device._id, status: ALERT_STATUS.OPEN },
        { status: ALERT_STATUS.RESOLVED, resolvedAt: new Date() }
      );
    }
  }

  return { device, previousStatus, newStatus, statusChanged };
}
