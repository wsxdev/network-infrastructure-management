export const DEVICE_TYPE_OPTIONS = Object.freeze([
  { value: 'router', label: 'Router / Gateway' },
  { value: 'switch', label: 'Switch administrable' },
  { value: 'switch_unmanaged', label: 'Switch no administrable' },
  { value: 'ap', label: 'Access Point' },
  { value: 'server', label: 'Servidor' },
  { value: 'workstation', label: 'Estación de trabajo' },
  { value: 'other', label: 'Otro equipo' }
]);

export const DEVICE_TYPE_LABELS = Object.freeze(
  Object.fromEntries(DEVICE_TYPE_OPTIONS.map(({ value, label }) => [value, label]))
);

export const CAPABILITY_LABELS = Object.freeze({
  none: 'Sin monitoreo directo',
  icmp_only: 'ICMP',
  snmp_only: 'SNMP',
  icmp_snmp: 'ICMP + SNMP'
});

const SNMP_CAPABLE_TYPES = new Set(['router', 'switch', 'ap']);

/**
 * Espejo en cliente de la regla RF-03.08, solo para la vista previa del
 * formulario. La fuente de verdad es el backend.
 */
export function previewMonitoringProfile(type, ipAddress) {
  const unmanaged = type === 'switch_unmanaged';
  const hasIp = typeof ipAddress === 'string' && ipAddress.trim().length > 0;

  if (unmanaged || !hasIp) {
    return {
      isMonitorable: false,
      monitoringCapability: 'none',
      status: 'unmonitored'
    };
  }

  return {
    isMonitorable: true,
    monitoringCapability: SNMP_CAPABLE_TYPES.has(type) ? 'icmp_snmp' : 'icmp_only',
    status: 'pending'
  };
}
