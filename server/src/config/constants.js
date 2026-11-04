/**
 * Constantes y límites seguros (Guardrails) de la especificación técnica (Sección 8.7).
 * ESPOCH - Proyecto Integrador de Saberes - PAO 5
 */

export const USER_ROLES = Object.freeze({
  ADMINISTRATOR: 'administrador',
  OPERATOR: 'operador'
});

export const DEVICE_STATUS = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  UNREACHABLE: 'unreachable',
  PENDING: 'pending'
});

export const DEVICE_TYPES = Object.freeze({
  ROUTER: 'router',
  SWITCH: 'switch',
  SERVER: 'server',
  WORKSTATION: 'workstation',
  ACCESS_POINT: 'ap',
  OTHER: 'other'
});

export const ALERT_SEVERITY = Object.freeze({
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
});

export const ALERT_STATUS = Object.freeze({
  OPEN: 'abierta',
  ACKNOWLEDGED: 'reconocida',
  RESOLVED: 'resuelta'
});

export const GUARDRAILS = Object.freeze({
  // Intervalos de comprobación ICMP (segundos)
  PING_INTERVAL_MIN: 10,
  PING_INTERVAL_MAX: 300,
  PING_INTERVAL_DEFAULT: 30,

  // Intervalos de descubrimiento de red (minutos)
  DISCOVERY_INTERVAL_MIN: 2,
  DISCOVERY_INTERVAL_MAX: 60,
  DISCOVERY_INTERVAL_DEFAULT: 10,

  // Timeout para sondas ICMP (milisegundos)
  PING_TIMEOUT_MIN: 1000,
  PING_TIMEOUT_MAX: 10000,
  PING_TIMEOUT_DEFAULT: 3000,

  // Umbral de fallos consecutivos para declarar DOWN
  FAILURES_FOR_DOWN_MIN: 2,
  FAILURES_FOR_DOWN_MAX: 10,
  FAILURES_FOR_DOWN_DEFAULT: 3,

  // Umbral de éxitos consecutivos para declarar UP
  SUCCESSES_FOR_UP_MIN: 1,
  SUCCESSES_FOR_UP_MAX: 5,
  SUCCESSES_FOR_UP_DEFAULT: 2,

  // Límite de concurrencia de p-limit (RNF-15)
  MAX_CONCURRENT_PINGS_MIN: 5,
  MAX_CONCURRENT_PINGS_MAX: 50,
  MAX_CONCURRENT_PINGS_DEFAULT: 15,

  // Umbral de quórum para switches no administrables (Regla 8.1: 70%)
  SWITCH_QUORUM_THRESHOLD: 0.70,

  // TTL de retención en MongoDB
  TTL_CHECKS_DAYS: 30,
  TTL_EVENTS_DAYS: 90,
  TTL_SESSIONS_HOURS: 24
});
