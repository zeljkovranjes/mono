import { serverEnvSchema, type IServerEnvSchema } from './schema';
import pkg from '../../../package.json';
import chalk from 'chalk';
import { findUpSync } from 'find-up';
import dotenv from 'dotenv';
import { getLogger } from '../logging';

let serverEnv: IServerEnvSchema | null = null;
const logger = getLogger();

/**
 * Attempts to locate and load a `.env` file from the current directory
 * or any parent directories, injecting its variables into `process.env`.
 *
 * @internal This helper is intended for internal bootstrap use when the
 *           environment is not already configured.
 */
function tryToLoadRootEnv(): string | null {
  const envPath = findUpSync('.env');
  if (envPath) {
    dotenv.config({ path: envPath });
    return envPath;
  } else {
    logger.warn('No .env file found in parent directories');
    return null;
  }
}

/**
 * Initializes the server environment for this package.
 *
 * If no `env` is provided, this function will attempt to load a `.env` file
 * (via {@link tryToLoadRootEnv}) and then fall back to `process.env`.
 *
 * @param env The environment source (defaults to `process.env` if omitted).
 *
 * Example:
 * ```ts
 * setupServer();               // auto-loads .env from the root and uses process.env
 * setupServer(process.env);    // uses given env object directly
 * ```
 */
export function setupServer(env?: Record<string, unknown>) {
  if (serverEnv) {
    return;
  }

  const name = chalk.underline(pkg.name);
  const version = chalk.dim(`v${pkg.version}`);

  logger.info(`Initializing server for ${name} ${version}...`);

  try {
    if (!env) {
      logger.info(`No environment provided, attempting to load .env file from mono root`);
      tryToLoadRootEnv();
      env = process.env;
    }

    serverEnv = serverEnvSchema.parse(env);
    logger.info(`Server environment ready for ${name} ${version}`);
  } catch (err) {
    logger.error(`Failed to validate server environment for ${name} ${version}`);
    logger.error({ err }, 'Details:');
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
