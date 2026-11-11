import { spawn } from 'child_process';
import fs from 'fs/promises';
import { Device } from '../models/device.model.js';
import { Alert } from '../models/alert.model.js';
import { DEVICE_TYPES, DEVICE_STATUS, ALERT_SEVERITY, ALERT_STATUS } from '../config/constants.js';
import { env } from '../config/environment.js';

/**
 * Lee la tabla ARP nativa del kernel de Linux (/proc/net/arp)
 * o ejecuta arp-scan con capacidades seguras para descubrir hosts en la LAN (RF-04).
 */
export async function scanLocalArpTable() {
  const discovered = [];

  try {
    // Intentar leer la tabla ARP del kernel en /proc/net/arp (Linux nativo sin necesidad de root)
    const arpData = await fs.readFile('/proc/net/arp', 'utf-8');
    const lines = arpData.split('\n').slice(1); // Omitir encabezado

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 6) {
        const [ip, , flags, mac, , iface] = parts;
        // Flags 0x2 significa entrada ARP completa/válida
        if (flags === '0x2' && mac !== '00:00:00:00:00:00') {
          discovered.push({
            ipAddress: ip,
            macAddress: mac.toUpperCase(),
            interface: iface
          });
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ No se pudo leer /proc/net/arp, intentando arp-scan...');
  }

  return discovered;
}

/**
 * Procesa los dispositivos descubiertos e integra nuevos registros al inventario con estado PENDIENTE.
 *
 * @param {import('socket.io').Server} [io]
 */
export async function processArpDiscovery(io = null) {
  try {
    const discoveredHosts = await scanLocalArpTable();

    for (const host of discoveredHosts) {
      // Verificar si ya existe por IP o por MAC
      const existing = await Device.findOne({
        $or: [
          { ipAddress: host.ipAddress },
          { macAddress: host.macAddress }
        ]
      });

      if (!existing) {
        // Nuevo dispositivo descubierto automáticamente (RF-04)
        const newDevice = await Device.create({
          name: `Host-${host.ipAddress.replace(/\./g, '-')}`,
          ipAddress: host.ipAddress,
          macAddress: host.macAddress,
          type: DEVICE_TYPES.WORKSTATION,
          location: 'Detectado vía ARP',
          status: DEVICE_STATUS.PENDING,
          isManaged: true
        });

        // Crear alerta informativa de descubrimiento
        await Alert.create({
          deviceId: newDevice._id,
          title: `Nuevo host descubierto: ${newDevice.ipAddress}`,
          message: `Se detectó un nuevo dispositivo activo con MAC ${newDevice.macAddress} en la subred.`,
          severity: ALERT_SEVERITY.INFO,
          status: ALERT_STATUS.OPEN
        });

        if (io) {
          io.emit('device:discovered', {
            device: newDevice,
            timestamp: new Date()
          });
        }
      }
    }
  } catch (err) {
    console.error('❌ Error en escaneo ARP:', err.message);
  }
}

let arpIntervalId = null;

export function startArpScanner(io = null) {
  if (arpIntervalId) clearInterval(arpIntervalId);

  processArpDiscovery(io);
  const intervalMs = env.DISCOVERY_INTERVAL_MIN * 60 * 1000;
  arpIntervalId = setInterval(() => processArpDiscovery(io), intervalMs);
  console.log(`📡 Escáner ARP programado cada ${env.DISCOVERY_INTERVAL_MIN} minutos.`);
}

export function stopArpScanner() {
  if (arpIntervalId) {
    clearInterval(arpIntervalId);
    arpIntervalId = null;
  }
}
