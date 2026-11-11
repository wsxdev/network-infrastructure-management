import {
  DEVICE_STATUS,
  DEVICE_TYPES,
  MONITORING_CAPABILITIES
} from '../config/constants.js';

/**
 * Reglas de monitoreo de dispositivos (RF-03.08).
 *
 * Un switch no administrable, o cualquier equipo sin IP de administración, se
 * conserva en el inventario pero no es monitorizable directamente: no recibe
 * sondeos y no puede generar una alerta de caída por una IP inexistente.
 *
 * Este módulo es puro (sin Mongoose) para poder probarlo de forma aislada.
 */

const SNMP_CAPABLE_TYPES = new Set([
  DEVICE_TYPES.ROUTER,
  DEVICE_TYPES.SWITCH,
  DEVICE_TYPES.ACCESS_POINT
]);

/** Convierte cadenas vacías o con espacios en `null`. */
export function normalizeIpAddress(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function hasIpAddress(value) {
  const normalized = normalizeIpAddress(value);
  return typeof normalized === 'string' && normalized.length > 0;
}

/**
 * Evalúa si un dispositivo puede monitorearse directamente y con qué método.
 *
 * @param {{ type?: string, ipAddress?: string|null }} device
 * @returns {{
 *   isMonitorable: boolean,
 *   monitoringCapability: string,
 *   status: string|null
 * }}
 */
export function resolveMonitoringProfile({ type, ipAddress } = {}) {
  const isUnmanagedSwitch = type === DEVICE_TYPES.SWITCH_UNMANAGED;

  if (isUnmanagedSwitch || !hasIpAddress(ipAddress)) {
    return {
      isMonitorable: false,
      monitoringCapability: MONITORING_CAPABILITIES.NONE,
      status: DEVICE_STATUS.UNMONITORED
    };
  }

  return {
    isMonitorable: true,
    monitoringCapability: SNMP_CAPABLE_TYPES.has(type)
      ? MONITORING_CAPABILITIES.ICMP_SNMP
      : MONITORING_CAPABILITIES.ICMP_ONLY,
    // `null` = conservar el estado operativo actual.
    status: null
  };
}

/**
 * Guarda defensiva: ningún equipo sin monitoreo directo puede recibir alertas
 * de caída, aunque en el futuro se agregue otro camino de generación.
 */
export function canReceiveAlerts(device) {
  if (!device) return false;

  return device.isMonitorable === true && hasIpAddress(device.ipAddress);
}

/**
 * Filtro que debe usar cualquier motor de sondeo para excluir el inventario
 * sin monitoreo directo (RF-03.08).
 */
export function buildMonitoringFilter(extra = {}) {
  return {
    isMonitorable: true,
    ipAddress: { $ne: null },
    ...extra
  };
}
