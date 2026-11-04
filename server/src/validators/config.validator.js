import { z } from 'zod';
import { GUARDRAILS } from '../config/constants.js';

export const updateConfigSchema = z.object({
  pingIntervalSec: z.number().int()
    .min(GUARDRAILS.PING_INTERVAL_MIN, `El intervalo mínimo es ${GUARDRAILS.PING_INTERVAL_MIN}s`)
    .max(GUARDRAILS.PING_INTERVAL_MAX, `El intervalo máximo es ${GUARDRAILS.PING_INTERVAL_MAX}s`),
  discoveryIntervalMin: z.number().int()
    .min(GUARDRAILS.DISCOVERY_INTERVAL_MIN, `El intervalo de descubrimiento mínimo es ${GUARDRAILS.DISCOVERY_INTERVAL_MIN}m`)
    .max(GUARDRAILS.DISCOVERY_INTERVAL_MAX, `El intervalo de descubrimiento máximo es ${GUARDRAILS.DISCOVERY_INTERVAL_MAX}m`),
  pingTimeoutMs: z.number().int()
    .min(GUARDRAILS.PING_TIMEOUT_MIN, `El timeout mínimo es ${GUARDRAILS.PING_TIMEOUT_MIN}ms`)
    .max(GUARDRAILS.PING_TIMEOUT_MAX, `El timeout máximo es ${GUARDRAILS.PING_TIMEOUT_MAX}ms`),
  consecutiveFailuresForDown: z.number().int()
    .min(GUARDRAILS.FAILURES_FOR_DOWN_MIN)
    .max(GUARDRAILS.FAILURES_FOR_DOWN_MAX),
  consecutiveSuccessesForUp: z.number().int()
    .min(GUARDRAILS.SUCCESSES_FOR_UP_MIN)
    .max(GUARDRAILS.SUCCESSES_FOR_UP_MAX),
  maxConcurrentPings: z.number().int()
    .min(GUARDRAILS.MAX_CONCURRENT_PINGS_MIN)
    .max(GUARDRAILS.MAX_CONCURRENT_PINGS_MAX)
});
