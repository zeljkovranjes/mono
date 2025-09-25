import { clientEnvSchema, type IClientEnvSchema } from './schema';

let clientEnv: IClientEnvSchema | null = null;

/**
 * Initializes the client environment for this package.
 *
 * @param env The validated client environment, typically created by parsing
 *            `import.meta.env` with `clientEnvSchema.parse(import.meta.env)`.
 *
 * Example:
 * ```ts
 * setupClientEnvironment(import.meta.env);
 * ```
 */
export function setupClientEnvironment(env: Record<string, unknown>) {
  if (clientEnv) {
    return;
  }

  console.log('→ Initializing client environment...');
  clientEnv = parse(env);
  console.log('✔ Client environment ready');
}

/**
 * Safe wrapper for parsing the client environment schema.
 *
 * @param env The environment source (e.g., import.meta.env).
 * @returns The validated client environment schema.
 * @throws Error if validation fails.
 */
function parse(env: Record<string, unknown>): IClientEnvSchema {
  try {
    const parsed = clientEnvSchema.parse(env);
    console.log('✔ Client environment variables validated');
    return parsed;
  } catch (err) {
    console.error('✘ Failed to validate client environment');
    console.error('Details:', err);
    throw err;
  }
}

/**
 * Returns the initialized client environment.
 *
 * @internal This function is intended only for internal use within
 *           `@safeoutput/lib`. Consumers of the library should not call
 *           it directly.
 */
export function getClientConfig(): IClientEnvSchema {
  if (!clientEnv) {
    throw new Error(
      'Client environment has not been initialized. Call setupClientEnvironment() at app startup.',
    );
  }
  return clientEnv;
}
