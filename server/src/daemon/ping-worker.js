import { spawn } from 'child_process';
import net from 'net';
import pLimit from 'p-limit';
import mongoose from 'mongoose';
import { Device } from '../models/device.model.js';
import { env } from '../config/environment.js';
import { recordPingResult } from '../services/device.service.js';
import { evaluateSwitchQuorums } from './quorum-evaluator.js';

/**
 * Ejecuta un ping ICMP seguro utilizando child_process.spawn.
 * Previene categóricamente la inyección de comandos en la shell (Estándar de Seguridad ISO/IEC 27001).
 *
 * @param {string} ipAddress - Dirección IP a verificar
 * @param {number} timeoutMs - Tiempo de espera en milisegundos
 * @returns {Promise<{ isAlive: boolean, responseTimeMs: number|null, errorMessage: string|null }>}
 */
export function executeSafePing(ipAddress, timeoutMs = 3000) {
  return new Promise((resolve) => {
    // 1. Validación defensiva de formato IP
    if (!net.isIP(ipAddress)) {
      return resolve({
        isAlive: false,
        responseTimeMs: null,
        errorMessage: `Dirección IP no válida: ${ipAddress}`
      });
    }

    const timeoutSec = Math.max(1, Math.round(timeoutMs / 1000));
    const startTime = Date.now();

    // 2. Invocación segura mediante spawn pasando argumentos como array (sin shell)
    const pingProcess = spawn('ping', ['-c', '1', '-W', String(timeoutSec), ipAddress]);

    let stdoutData = '';
    let stderrData = '';

    pingProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pingProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pingProcess.on('close', (exitCode) => {
      const elapsed = Date.now() - startTime;

      if (exitCode === 0) {
        // Extraer rtt del formato "time=X.XX ms" si existe
        const rttMatch = stdoutData.match(/time=([0-9.]+)\s*ms/);
        const responseTimeMs = rttMatch ? parseFloat(rttMatch[1]) : elapsed;

        return resolve({
          isAlive: true,
          responseTimeMs: Math.round(responseTimeMs),
          errorMessage: null
        });
      }

      return resolve({
        isAlive: false,
        responseTimeMs: null,
        errorMessage: stderrData.trim() || `Host inaccesible (código de salida ${exitCode})`
      });
    });

    pingProcess.on('error', (err) => {
      resolve({
        isAlive: false,
        responseTimeMs: null,
        errorMessage: `Fallo al invocar binario de red ping: ${err.message}`
      });
    });
  });
}

let pingIntervalId = null;
let isCycleRunning = false;

/**
 * Inicia el bucle centinela del daemon de monitoreo con concurrencia limitada.
 *
 * @param {import('socket.io').Server} [io] - Instancia de Socket.io para emisión en tiempo real
 */
export function startPingWorker(io = null) {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
  }

  const runCycle = async () => {
    if (isCycleRunning) return;
    if (mongoose.connection.readyState !== 1) {
      return; // Base de datos en enlace / reconexión: posponer ciclo sin saturar
    }
    isCycleRunning = true;

    try {
      // 1. Obtener todos los dispositivos administrables activos con IP
      const devices = await Device.find({
        isDeleted: false,
        isManaged: true,
        ipAddress: { $ne: null, $exists: true }
      }).maxTimeMS(3000);

      if (devices.length === 0) {
        isCycleRunning = false;
        return;
      }

      // 2. Límite de concurrencia estricto (RNF-15: p-limit a 15)
      const limit = pLimit(env.MAX_CONCURRENT_PINGS);

      const checkPromises = devices.map((device) =>
        limit(async () => {
          const pingResult = await executeSafePing(device.ipAddress, env.PING_TIMEOUT_MS);
          const updateResult = await recordPingResult(device._id, pingResult);

          if (updateResult && updateResult.statusChanged && io) {
            io.emit('device:statusChanged', {
              deviceId: device._id,
              name: device.name,
              ipAddress: device.ipAddress,
              previousStatus: updateResult.previousStatus,
              newStatus: updateResult.newStatus,
              timestamp: new Date()
            });
          }

          return updateResult;
        })
      );

      // allSettled garantiza que la falla de una comprobación no cancele a las demás
      await Promise.allSettled(checkPromises);

      // 3. Evaluar quórum de switches no administrables (Regla 8.1)
      await evaluateSwitchQuorums(io);

      // 4. Emitir pulso de ciclo completado
      if (io) {
        io.emit('daemon:cycleCompleted', {
          deviceCount: devices.length,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.warn('⚠️ Ciclo del Ping Worker pospuesto:', err.message);
    } finally {
      isCycleRunning = false;
    }
  };

  // Ejecución inicial y programación en intervalo seguro
  runCycle();
  pingIntervalId = setInterval(runCycle, env.PING_INTERVAL_SEC * 1000);
  console.log(`🛡️ Escuadrón Centinela iniciado: Intervalo=${env.PING_INTERVAL_SEC}s, Concurrencia=${env.MAX_CONCURRENT_PINGS}`);
}

export function stopPingWorker() {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
    console.log('⏹️ Escuadrón Centinela detenido.');
  }
}
