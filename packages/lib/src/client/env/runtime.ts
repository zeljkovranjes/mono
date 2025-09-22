import { type IClientEnvSchema } from './schema';
import pkg from '../../../package.json';
import chalk from 'chalk';

export interface ClientEnv {
  client: IClientEnvSchema;
}

let clientEnv: ClientEnv | null = null;

/**
 * Initializes the client environment for this package.
 *
 * @param cfg The validated client environment, typically created by parsing
 *            `import.meta.env` with `clientEnvSchema.parse(import.meta.env)`.
 *
 * Example:
 * ```ts
 * setupClient({
 *   client: clientEnvSchema.parse(import.meta.env),
 * });
 * ```
 */
export function setupClient(cfg: ClientEnv) {
  const name = chalk.underline(pkg.name);
  const version = chalk.dim(`v${pkg.version}`);

  console.log(chalk.gray(`→ Initializing client for ${name} ${version}...`));
  clientEnv = cfg;
  console.log(chalk.green(`✔ Client environment ready for ${name} ${version}`));
}

/**
 * Returns the initialized client environment.
 *
 * @internal This function is intended only for internal use within
 *           `@safeoutput/lib`. Consumers of the library should not call
 *           it directly.
 */
export function getClientConfig(): ClientEnv {
  if (!clientEnv) {
    throw new Error(
      'Client environment has not been initialized. Call setupClient() at app startup.',
    );
  }
  return clientEnv;
}
