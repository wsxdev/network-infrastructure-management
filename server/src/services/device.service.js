import { DEVICE_STATUS } from '../config/constants.js';
import {
  normalizeIpAddress,
  resolveMonitoringProfile
} from '../domain/monitoring.js';
import { Device } from '../models/device.model.js';

const WRITABLE_FIELDS = [
  'name',
  'ipAddress',
  'macAddress',
  'type',
  'brand',
  'model',
  'location'
];

function pickWritable(payload = {}) {
  return Object.fromEntries(
    WRITABLE_FIELDS.filter((field) => payload[field] !== undefined).map(
      (field) => [field, payload[field]]
    )
  );
}

/**
 * Construye el payload persistible aplicando RF-03.08.
 * Exportado para pruebas unitarias.
 */
export function buildDevicePayload(payload = {}) {
  const data = pickWritable(payload);

  data.ipAddress = normalizeIpAddress(data.ipAddress);

  const profile = resolveMonitoringProfile({
    type: data.type,
    ipAddress: data.ipAddress
  });

  data.isMonitorable = profile.isMonitorable;
  data.monitoringCapability = profile.monitoringCapability;
  data.status = profile.isMonitorable
    ? DEVICE_STATUS.PENDING
    : DEVICE_STATUS.UNMONITORED;

  return data;
}

export async function createDevice(payload) {
  const data = buildDevicePayload(payload);
  const device = await Device.create(data);
  return device.toObject();
}

export async function listDevices() {
  return Device.find()
    .sort({ isMonitorable: 1, name: 1 })
    .lean();
}
