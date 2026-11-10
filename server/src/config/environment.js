import dotenv from 'dotenv';
import { z } from 'zod';
import { GUARDRAILS } from './constants.js';

dotenv.config();

const environmentSchema = z.object({
  PORT: z.string().transform(Number).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/network_monitoring'),
  JWT_SECRET: z.string().min(16).default('super_secret_jwt_access_key_espoch_noc_2026'),
  JWT_REFRESH_SECRET: z.string().min(16).default('super_secret_jwt_refresh_key_espoch_noc_2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Guardrails de monitoreo
  PING_INTERVAL_SEC: z.string().transform(Number).default(String(GUARDRAILS.PING_INTERVAL_DEFAULT)),
  DISCOVERY_INTERVAL_MIN: z.string().transform(Number).default(String(GUARDRAILS.DISCOVERY_INTERVAL_DEFAULT)),
  PING_TIMEOUT_MS: z.string().transform(Number).default(String(GUARDRAILS.PING_TIMEOUT_DEFAULT)),
  CONSECUTIVE_FAILURES_FOR_DOWN: z.string().transform(Number).default(String(GUARDRAILS.FAILURES_FOR_DOWN_DEFAULT)),
  CONSECUTIVE_SUCCESSES_FOR_UP: z.string().transform(Number).default(String(GUARDRAILS.SUCCESSES_FOR_UP_DEFAULT)),
  MAX_CONCURRENT_PINGS: z.string().transform(Number).default(String(GUARDRAILS.MAX_CONCURRENT_PINGS_DEFAULT)),
  SWITCH_QUORUM_THRESHOLD: z.string().transform(Number).default(String(GUARDRAILS.SWITCH_QUORUM_THRESHOLD))
});

const parsedEnv = environmentSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('[ERROR] Error de validacion en variables de entorno:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
