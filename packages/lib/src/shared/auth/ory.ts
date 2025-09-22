import { FrontendApi, Configuration } from '@ory/client';
import { getOryBaseUrl } from './helper';

/**
 * Create an Ory Frontend API client for browser-side interactions.
 *
 * Typical usage:
 * - Starting self-service flows (login, registration, recovery, settings)
 * - Handling browser-based authentication and session management
 *
 * @returns A configured instance of `FrontendApi` for communicating with Ory.
 */
export function getOryFrontend() {
  return new FrontendApi(
    new Configuration({
      basePath: getOryBaseUrl(),
      baseOptions: { withCredentials: true },
    }),
  );
}
