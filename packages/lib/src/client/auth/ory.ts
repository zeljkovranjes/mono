import { FrontendApi, Configuration } from '@ory/client';
import { getClientConfig } from '../env/runtime';

/**
 * Returns the best ORY base URL depending on runtime (CLIENT VARIANT).
 *
 * Priority order:
 *   1. VITE_KRATOS_BROWSER_URL
 *   2. VITE_KRATOS_PUBLIC_URL
 *   3. VITE_ORY_SDK_URL
 *   4. fallback playground URL
 */
export function getOryBaseUrl(): string {
  const config = getClientConfig();
  return (
    config.VITE_KRATOS_BROWSER_URL ??
    config.VITE_KRATOS_PUBLIC_URL ??
    config.VITE_ORY_SDK_URL ??
    'https://playground.projects.oryapis.com/'
  );
}

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
