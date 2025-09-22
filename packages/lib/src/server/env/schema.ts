import { z } from 'zod';

export const serverEnvSchema = z.object({
  // ── Runtime & Logging ───────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),

  // ── ORY (Admin & Consent) ───────────────────────────────────────────
  ORY_ADMIN_API_TOKEN: z.string().min(1),
  REMEMBER_CONSENT_SESSION_FOR_SECONDS: z.coerce.number().default(3600),

  // ── Security & Cookies ──────────────────────────────────────────────
  COOKIE_SECRET: z.string().min(8),
  CSRF_COOKIE_NAME: z.string(),
  CSRF_COOKIE_SECRET: z.string(),
  DANGEROUSLY_DISABLE_SECURE_CSRF_COOKIES: z.string().transform((val) => val === 'true'),
  MOCK_TLS_TERMINATION: z.string().transform((val) => val === 'true'),

  // ── API Secrets ─────────────────────────────────────────────────────
  API_SECRET_KEY: z.string().min(1),

  // ── Payments (Stripe) ───────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  // ── Database (Postgres) ─────────────────────────────────────────────
  POSTGRES_DATABASE_URL: z.string().url(),

  // ── Telemetry (OpenTelemetry) ───────────────────────────────────────
  OTEL_EXPORTER_URL: z.string().url().optional(),
});

export type IServerEnvSchema = z.infer<typeof serverEnvSchema>;
