import { asyncHandler } from '../middlewares/async-handler.js';
import { GUARDRAILS } from '../config/constants.js';
import { env } from '../config/environment.js';
import { Audit } from '../models/audit.model.js';
import { startPingWorker } from '../daemon/ping-worker.js';

export const getConfig = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      current: {
        pingIntervalSec: env.PING_INTERVAL_SEC,
        discoveryIntervalMin: env.DISCOVERY_INTERVAL_MIN,
        pingTimeoutMs: env.PING_TIMEOUT_MS,
        consecutiveFailuresForDown: env.CONSECUTIVE_FAILURES_FOR_DOWN,
        consecutiveSuccessesForUp: env.CONSECUTIVE_SUCCESSES_FOR_UP,
        maxConcurrentPings: env.MAX_CONCURRENT_PINGS,
        switchQuorumThreshold: env.SWITCH_QUORUM_THRESHOLD
      },
      guardrails: GUARDRAILS
    }
  });
});

export const updateConfig = asyncHandler(async (req, res) => {
  const previousConfig = { ...env };
  const updates = req.body;

  // Actualizar variables en memoria
  if (updates.pingIntervalSec) env.PING_INTERVAL_SEC = updates.pingIntervalSec;
  if (updates.discoveryIntervalMin) env.DISCOVERY_INTERVAL_MIN = updates.discoveryIntervalMin;
  if (updates.pingTimeoutMs) env.PING_TIMEOUT_MS = updates.pingTimeoutMs;
  if (updates.consecutiveFailuresForDown) env.CONSECUTIVE_FAILURES_FOR_DOWN = updates.consecutiveFailuresForDown;
  if (updates.consecutiveSuccessesForUp) env.CONSECUTIVE_SUCCESSES_FOR_UP = updates.consecutiveSuccessesForUp;
  if (updates.maxConcurrentPings) env.MAX_CONCURRENT_PINGS = updates.maxConcurrentPings;

  // Reiniciar el worker con el nuevo intervalo si cambió
  if (updates.pingIntervalSec || updates.maxConcurrentPings) {
    startPingWorker(req.app.get('io'));
  }

  // Registrar auditoría administrativa inmutable (RNF-08)
  await Audit.create({
    userId: req.user._id,
    userEmail: req.user.email,
    action: 'CONFIG_UPDATE',
    targetType: 'SystemConfig',
    details: { previous: previousConfig, updated: updates }
  });

  return res.status(200).json({
    success: true,
    message: 'Parámetros del sistema actualizados dentro de los límites seguros (Guardrails).',
    data: updates
  });
});

export const resetConfig = asyncHandler(async (req, res) => {
  env.PING_INTERVAL_SEC = GUARDRAILS.PING_INTERVAL_DEFAULT;
  env.DISCOVERY_INTERVAL_MIN = GUARDRAILS.DISCOVERY_INTERVAL_DEFAULT;
  env.PING_TIMEOUT_MS = GUARDRAILS.PING_TIMEOUT_DEFAULT;
  env.CONSECUTIVE_FAILURES_FOR_DOWN = GUARDRAILS.FAILURES_FOR_DOWN_DEFAULT;
  env.CONSECUTIVE_SUCCESSES_FOR_UP = GUARDRAILS.SUCCESSES_FOR_UP_DEFAULT;
  env.MAX_CONCURRENT_PINGS = GUARDRAILS.MAX_CONCURRENT_PINGS_DEFAULT;

  startPingWorker(req.app.get('io'));

  await Audit.create({
    userId: req.user._id,
    userEmail: req.user.email,
    action: 'CONFIG_RESET_DEFAULTS',
    targetType: 'SystemConfig',
    details: { resetToDefaults: true }
  });

  return res.status(200).json({
    success: true,
    message: 'Parámetros de monitoreo restablecidos a valores estándar predeterminados.'
  });
});
