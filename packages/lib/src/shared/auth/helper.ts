import { FrontendApi, Configuration } from '@ory/client';
import { getClientConfig } from '../../client/env/runtime';
import { getServerConfig } from '../../server/env/runtime';

const FALLBACK_URL = 'https://playground.projects.oryapis.com/';

/**
 * Returns the best ORY base URL depending on runtime (server vs client).
 *
 * Priority order:
 *   1. VITE_KRATOS_BROWSER_URL
 *   2. VITE_KRATOS_PUBLIC_URL
 *   3. VITE_ORY_SDK_URL
 *   4. fallback playground URL
 */
export function getOryBaseUrl(): string {
  const isServer = typeof window === 'undefined';
  const config = isServer ? getServerConfig() : getClientConfig();

  return (
    config.VITE_KRATOS_BROWSER_URL ??
    config.VITE_KRATOS_PUBLIC_URL ??
    config.VITE_ORY_SDK_URL ??
    FALLBACK_URL
  );
}

/**
 * Build a URL for an Ory self-service flow.
 *
 * @param apiBaseUrl - The Ory API base URL
 * @param flowType - The type of flow (e.g. "login", "registration", "settings")
 * @param params - Optional query parameters
 *
 * @returns The flow URL.
 */
export function getUrlForFlow(
  apiBaseUrl: string,
  flowType: string,
  params?: URLSearchParams,
): string {
  const url = new URL(`${apiBaseUrl}/self-service/${flowType}/browser`);
  if (params) {
    params.forEach((value, key) => url.searchParams.set(key, value));
  }
  return url.toString();
}

/**
 * Handle a 403 error from Ory by redirecting to a 2FA (AAL2) login flow.
 *
 * @param apiBaseUrl - The Ory API base URL
 * @param currentUrl - The current page URL (used for return_to)
 * @param err - The error to inspect
 *
 * @returns A URL for initiating 2FA, or null if not required
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function maybeInitiate2FA(apiBaseUrl: string, currentUrl: string, err: any): string | null {
  if (err?.response?.status === 403) {
    return getUrlForFlow(
      apiBaseUrl,
      'login',
      new URLSearchParams({
        aal: 'aal2',
        return_to: currentUrl,
      }),
    );
  }
  return null;
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
