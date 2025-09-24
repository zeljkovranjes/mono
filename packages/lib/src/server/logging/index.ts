import pino, { LoggerOptions, Logger } from 'pino';
import { getServerConfig } from '../env/runtime';

function getLogLevel(): string {
  try {
    return getServerConfig().LOG_LEVEL;
  } catch {
    // prevent circular dependency.
    return process.env.LOG_LEVEL || 'trace';
  }
}

/**
 * Builds the logger configuration options for pino.
 *
 * @returns LoggerOptions The configuration object used to initialize pino.
 *
 * Example:
 * ```ts
 * const options = getLoggerOptions();
 * console.log(options);
 * ```
 */
export function getLoggerOptions(): LoggerOptions {
  const logLevel = getLogLevel();

  if (process.stdout?.isTTY) {
    return {
      level: logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    };
  }

  return {
    level: logLevel,
  };
}

/**
 * Build and return a pino logger instance.
 *
 * @returns Logger A fully configured pino logger instance.
 *
 * Example:
 * ```ts
 * const logger = getLogger();
 * logger.info('Server started');
 * ```
 */
export function getLogger(): Logger {
  return pino(getLoggerOptions());
}
