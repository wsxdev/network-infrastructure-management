import { Device } from '../models/device.model.js';
import { Alert } from '../models/alert.model.js';
import { Event } from '../models/event.model.js';
import { DEVICE_TYPES, DEVICE_STATUS, ALERT_SEVERITY, ALERT_STATUS } from '../config/constants.js';
import { env } from '../config/environment.js';

/**
 * Evalúa el quórum colectivo para switches (Regla 8.1 de la especificación técnica).
 * Si más del 70% de los dispositivos dependientes están caídos, se marca el switch
 * y se consolidan las alertas para evitar tormentas de notificaciones.
 *
 * @param {import('socket.io').Server} [io] - Instancia de Socket.io
 */
export async function evaluateSwitchQuorums(io = null) {
  try {
    // Buscar todos los switches activos
    const switches = await Device.find({
      type: DEVICE_TYPES.SWITCH,
      isDeleted: false
    });

    for (const sw of switches) {
      // Obtener todos los dispositivos que tienen a este switch como parentId
      const children = await Device.find({
        parentId: sw._id,
        isDeleted: false
      });

      if (children.length === 0) continue;

      const downOrUnreachable = children.filter(
        c => c.status === DEVICE_STATUS.DOWN || c.status === DEVICE_STATUS.UNREACHABLE
      );

      const failureRatio = downOrUnreachable.length / children.length;

      // Si el porcentaje supera el umbral de quórum (70% por defecto)
      if (failureRatio >= env.SWITCH_QUORUM_THRESHOLD) {
        if (sw.status !== DEVICE_STATUS.DOWN) {
          const prevStatus = sw.status;
          sw.status = DEVICE_STATUS.DOWN;
          await sw.save();

          await Event.create({
            deviceId: sw._id,
            previousStatus: prevStatus,
            newStatus: DEVICE_STATUS.DOWN,
            reason: `Fallo de quórum de switch: ${downOrUnreachable.length}/${children.length} (${Math.round(failureRatio * 100)}%) de los dispositivos dependientes están sin respuesta.`
          });

          // Alerta consolidada crítica de infraestructura
          await Alert.create({
            deviceId: sw._id,
            title: `Quórum Crítico de Infraestructura: Switch ${sw.name}`,
            message: `El switch ${sw.name} presenta ${downOrUnreachable.length} de ${children.length} dispositivos caídos. Se presume falla troncal o de alimentación.`,
            severity: ALERT_SEVERITY.CRITICAL,
            status: ALERT_STATUS.OPEN
          });

          // Marcar hijos caídos como UNREACHABLE para distinguir aislamiento de falla del host
          for (const child of children) {
            if (child.status === DEVICE_STATUS.DOWN) {
              child.status = DEVICE_STATUS.UNREACHABLE;
              await child.save();
            }
          }

          if (io) {
            io.emit('switch:quorumAlert', {
              switchId: sw._id,
              switchName: sw.name,
              affectedDevices: downOrUnreachable.length,
              totalDevices: children.length
            });
          }
        }
      } else if (sw.status === DEVICE_STATUS.DOWN && failureRatio < 0.3) {
        // Recuperación del switch si la mayoría de hijos responde
        const prevStatus = sw.status;
        sw.status = DEVICE_STATUS.UP;
        await sw.save();

        await Event.create({
          deviceId: sw._id,
          previousStatus: prevStatus,
          newStatus: DEVICE_STATUS.UP,
          reason: `Recuperación de quórum de switch: Más del 70% de los dispositivos dependientes han restablecido comunicación.`
        });

        await Alert.updateMany(
          { deviceId: sw._id, status: ALERT_STATUS.OPEN },
          { status: ALERT_STATUS.RESOLVED, resolvedAt: new Date() }
        );
      }
    }
  } catch (err) {
    console.error('❌ Error en evaluación de quórum:', err.message);
  }
}
