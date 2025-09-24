import { clientEnvSchema, type IClientEnvSchema } from './schema';
import pkg from '../../../package.json';
import chalk from 'chalk';

let clientEnv: IClientEnvSchema | null = null;

/**
 * Initializes the client environment for this package.
 *
 * @param cfg The validated client environment, typically created by parsing
 *            `import.meta.env` with `clientEnvSchema.parse(import.meta.env)`.
 *
 * Example:
 * ```ts
 * setupClientEnvironment({
 *   client: clientEnvSchema.parse(import.meta.env),
 * });
 * ```
 */
export function setupClientEnvironment(env: Record<string, unknown>) {
  if (clientEnv) {
    return;
  }

  const name = chalk.underline(pkg.name);
  const version = chalk.dim(`v${pkg.version}`);

  console.log(chalk.gray(`→ Initializing client for ${name} ${version}...`));
  clientEnv = parse(env);
  console.log(chalk.green(`✔ Client environment ready for ${name} ${version}`));
}

/**
 * Safe wrapper for parsing the client environment schema.
 *
 * @param env The environment source (e.g., import.meta.env).
 * @returns The validated client environment schema.
 * @throws Error if validation fails.
 *
 * Example:
 * ```ts
 * const cfg = clientEnvSchema(process.env);
 * setupServer(cfg);
 * ```
 */
function parse(env: Record<string, unknown>): IClientEnvSchema {
  const name = chalk.underline(pkg.name);
  const version = chalk.dim(`v${pkg.version}`);

  try {
    const parsed = clientEnvSchema.parse(env);
    console.log(chalk.green(`✔ Client environment variables validated for ${name} ${version}`));
    return parsed;
  } catch (err) {
    console.error(chalk.red(`✘ Failed to validate client environment for ${name} ${version}`));
    console.error(chalk.yellow('Details:'), err);
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
      'Client environment has not been initialized. Call setupClient() at app startup.',
    );
  }
  return clientEnv;
}
