import { Device } from '../models/device.model.js';
import { DEVICE_TYPES, DEVICE_STATUS } from '../config/constants.js';

/**
 * Calcula la topología de red retornando nodos y aristas para React Flow.
 * Diferencia enlaces confirmados (línea sólida) de enlaces inferidos (línea discontinua).
 */
export async function getTopologyGraph() {
  const devices = await Device.find({ isDeleted: false });

  // Niveles jerárquicos para posicionamiento automático
  const typeLevels = {
    [DEVICE_TYPES.ROUTER]: 1,
    [DEVICE_TYPES.SWITCH]: 2,
    [DEVICE_TYPES.SERVER]: 3,
    [DEVICE_TYPES.ACCESS_POINT]: 3,
    [DEVICE_TYPES.WORKSTATION]: 4,
    [DEVICE_TYPES.OTHER]: 4
  };

  // Contadores por nivel para espaciado horizontal
  const levelCounters = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const levelY = { 1: 50, 2: 200, 3: 380, 4: 560 };

  const nodes = [];
  const edges = [];

  // Encuentra un switch o router central por defecto para enlaces inferidos si no hay padre
  const defaultGateway = devices.find(d => d.type === DEVICE_TYPES.ROUTER) || devices.find(d => d.type === DEVICE_TYPES.SWITCH);

  for (const device of devices) {
    const level = typeLevels[device.type] || 4;
    const colIndex = levelCounters[level]++;
    const x = 120 + colIndex * 220;
    const y = levelY[level];

    nodes.push({
      id: device._id.toString(),
      type: 'customDeviceNode',
      position: { x, y },
      data: {
        id: device._id.toString(),
        name: device.name,
        ipAddress: device.ipAddress,
        macAddress: device.macAddress,
        type: device.type,
        status: device.status,
        responseTimeMs: device.responseTimeMs,
        location: device.location,
        isManaged: device.isManaged
      }
    });

    if (device.parentId) {
      // Enlace Confirmado (Línea continua)
      edges.push({
        id: `e-${device.parentId.toString()}-${device._id.toString()}`,
        source: device.parentId.toString(),
        target: device._id.toString(),
        animated: device.status === DEVICE_STATUS.UP,
        style: {
          stroke: device.status === DEVICE_STATUS.DOWN ? '#EF4444' : '#395649',
          strokeWidth: 2
        },
        data: { linkType: 'confirmed', label: 'Físico' }
      });
    } else if (defaultGateway && defaultGateway._id.toString() !== device._id.toString() && level > 1) {
      // Enlace Inferido (Línea discontinua con strokeDasharray)
      edges.push({
        id: `e-inferred-${defaultGateway._id.toString()}-${device._id.toString()}`,
        source: defaultGateway._id.toString(),
        target: device._id.toString(),
        animated: true,
        style: {
          stroke: '#92b6a3',
          strokeWidth: 1.5,
          strokeDasharray: '5,5'
        },
        data: { linkType: 'inferred', label: 'Inferido' }
      });
    }
  }

  return { nodes, edges };
}
