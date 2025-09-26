import {
  ApiResponseTypeSchema,
  HttpStatusCodeSchema,
  customApiResponse,
} from '@safeoutput/contracts/base.schema';
import { z, ZodError } from 'zod';

export type ApiResponseType = z.infer<typeof ApiResponseTypeSchema>;
export type HttpStatusCode = z.infer<typeof HttpStatusCodeSchema>;

/**
 * Represents an operational error that can be converted into an API response.
 *
 * @example
 * throw new AppError('Not Found', 404, '/orgs/abc')
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly instancePtr: string;
  public readonly details?: unknown;

  /**
   * Constructs a new AppError.
   *
   * @param message - Human-readable error message.
   * @param statusCode - HTTP status code (default: 500).
   * @param instancePtr - RFC7807-style instance pointer (default: '/').
   * @param details - Optional machine-readable details (e.g., validation).
   *
   * @example
   * const err = new AppError('Unauthorized', 401, '/auth/login', { reason: 'no token' })
   */
  constructor(
    message: string,
    statusCode: HttpStatusCode = 500,
    instancePtr = '/',
    details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.instancePtr = instancePtr;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);
  }

  /**
   * Converts the error to a standardized API response.
   *
   * @returns API response envelope with `status: 'error'`.
   *
   * @example
   * return AppError.notFound().toApiResponse()
   */
  toApiResponse<T = never>() {
    return customApiResponse<T>(
      this.instancePtr,
      this.message,
      'error',
      this.statusCode,
      undefined,
    );
  }

  /**
   * Serializes the error for logs/telemetry.
   *
   * @returns Plain JSON with name, message, statusCode, instancePtr, details.
   *
   * @example
   * logger.error(err.toJSON())
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      instancePtr: this.instancePtr,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }

  /**
   * Creates a 400 Bad Request error.
   *
   * @param msg - Error message.
   * @param ptr - Instance pointer.
   * @param details - Optional details.
   * @example
   * throw AppError.badRequest('Invalid slug', '/orgs')
   */
  static badRequest(msg: string, ptr = '/', details?: unknown) {
    return new AppError(msg, 400 as HttpStatusCode, ptr, details);
  }

  /**
   * Creates a 401 Unauthorized error.
   *
   * @example
   * throw AppError.unauthorized()
   */
  static unauthorized(msg = 'Unauthorized', ptr = '/', details?: unknown) {
    return new AppError(msg, 401 as HttpStatusCode, ptr, details);
  }

  /**
   * Creates a 403 Forbidden error.
   *
   * @example
   * throw AppError.forbidden('Not allowed', '/projects/123')
   */
  static forbidden(msg = 'Forbidden', ptr = '/', details?: unknown) {
    return new AppError(msg, 403 as HttpStatusCode, ptr, details);
  }

  /**
   * Creates a 404 Not Found error.
   *
   * @example
   * throw AppError.notFound('Org not found', '/orgs/abc')
   */
  static notFound(msg = 'Not Found', ptr = '/', details?: unknown) {
    return new AppError(msg, 404 as HttpStatusCode, ptr, details);
  }

  /**
   * Creates a 409 Conflict error.
   *
   * @example
   * throw AppError.conflict('Slug already taken', '/orgs')
   */
  static conflict(msg = 'Conflict', ptr = '/', details?: unknown) {
    return new AppError(msg, 409 as HttpStatusCode, ptr, details);
  }

  /**
   * Creates a 422 Unprocessable Entity error.
   *
   * @example
   * throw AppError.unprocessable('Invalid payload', '/api/resource')
   */
  static unprocessable(msg = 'Unprocessable Entity', ptr = '/', details?: unknown) {
    return new AppError(msg, 422 as HttpStatusCode, ptr, details);
  }

  /**
   * Creates a 429 Too Many Requests error.
   *
   * @example
   * throw AppError.tooManyRequests('Rate limit exceeded', '/api/search')
   */
  static tooManyRequests(msg = 'Too Many Requests', ptr = '/', details?: unknown) {
    return new AppError(msg, 429 as HttpStatusCode, ptr, details);
  }

  /**
   * Creates a 500 Internal Server Error.
   *
   * @example
   * throw AppError.internal('Unexpected failure', '/jobs/run')
   */
  static internal(msg = 'Internal Server Error', ptr = '/', details?: unknown) {
    return new AppError(msg, 500 as HttpStatusCode, ptr, details);
  }
}

/**
 * Type guard to check if a value is an AppError.
 *
 * @param u - Unknown value to test.
 * @returns True if `u` is an AppError.
 *
 * @example
 * if (isAppError(err)) return err.toApiResponse()
 */
export const isAppError = (u: unknown): u is AppError => u instanceof AppError;

/**
 * Normalizes any thrown value into an AppError.
 *
 * @param u - Unknown error value.
 * @param fallback - HTTP status to use if `u` isn’t an AppError (default 500).
 * @param ptr - Instance pointer.
 * @returns AppError instance.
 *
 * @example
 * const err = fromUnknown(e, 500, '/orgs'); return err.toApiResponse()
 */
export const fromUnknown = (u: unknown, fallback: HttpStatusCode = 500, ptr = '/'): AppError => {
  if (u instanceof AppError) return u;
  if (u instanceof Error) return new AppError(u.message || 'Error', fallback, ptr, { cause: u });
  if (typeof u === 'string') return new AppError(u, fallback, ptr);
  return new AppError('Unknown error', fallback, ptr, { value: u });
};

/**
 * Converts a ZodError into an AppError with flattened details.
 *
 * @param err - Zod validation error.
 * @param status - HTTP status (default 422).
 * @param ptr - Instance pointer.
 * @returns AppError instance.
 *
 * @example
 * catch (e) { if (e instanceof ZodError) throw fromZodError(e, 422, '/users') }
 */
export const fromZodError = (err: ZodError, status: HttpStatusCode = 422, ptr = '/'): AppError =>
  new AppError('Validation failed', status, ptr, err.flatten ? err.flatten() : err);

/**
 * Builds a standardized success API response.
 *
 * @param instancePtr - RFC7807-style instance pointer.
 * @param message - Human-readable message.
 * @param code - HTTP success code (200, 201, 204).
 * @param data - Optional payload.
 * @returns API response envelope with `status: 'success'`.
 *
 * @example
 * return toOkResponse('/orgs', 'Created', 201, { id })
 */
export function toOkResponse<T>(
  instancePtr: string,
  message: string,
  code: Extract<HttpStatusCode, 200 | 201 | 204> = 200,
  data?: T,
) {
  return customApiResponse<T>(instancePtr, message, 'success', code, data);
}
