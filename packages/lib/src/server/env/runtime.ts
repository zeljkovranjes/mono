import { serverEnvSchema, type IServerEnvSchema } from './schema';
import pkg from '../../../package.json';
import chalk from 'chalk';

let serverEnv: IServerEnvSchema | null = null;

/**
 * Initializes the server environment for this package.
 *
 * @param env The environment source (e.g., process.env).
 *
 * Example:
 * ```ts
 * setupServer(process.env);
 * ```
 */
export function setupServer(env: Record<string, unknown>) {
  if (serverEnv) {
    return;
  }

  const name = chalk.underline(pkg.name);
  const version = chalk.dim(`v${pkg.version}`);

  console.log(chalk.gray(`→ Initializing server for ${name} ${version}...`));

  try {
    serverEnv = serverEnvSchema.parse(env);
    console.log(chalk.green(`✔ Server environment ready for ${name} ${version}`));
  } catch (err) {
    console.error(chalk.red(`✘ Failed to validate server environment for ${name} ${version}`));
    console.error(chalk.yellow('Details:'), err);
    throw err;
  }
}

/**
 * Safe wrapper for parsing the server environment schema.
 *
 * @param env The environment source (e.g., process.env).
 * @returns The validated server environment schema.
 * @throws Error if validation fails.
 *
 * Example:
 * ```ts
 * const cfg = parseServerEnv(process.env);
 * setupServer({ server: cfg });
 * ```
 */
export function parse(env: Record<string, unknown>): IServerEnvSchema {
  const name = chalk.underline(pkg.name);
  const version = chalk.dim(`v${pkg.version}`);

  try {
    const parsed = serverEnvSchema.parse(env);
    console.log(chalk.green(`✔ Server environment variables validated for ${name} ${version}`));
    return parsed;
  } catch (err) {
    console.error(chalk.red(`✘ Failed to validate server environment for ${name} ${version}`));
    console.error(chalk.yellow('Details:'), err);
    throw err;
  }
}

/**
 * Returns the initialized server environment.
 *
 * @internal This function is intended only for internal use within
 *           `@safeoutput/lib`. Consumers of the library should not call
 *           it directly.
 */
export function getServerConfig(): IServerEnvSchema {
  if (!serverEnv) {
    throw new Error(
      'Server environment has not been initialized. Call setupServer() at app startup.',
    );
  }
  return serverEnv;
}
