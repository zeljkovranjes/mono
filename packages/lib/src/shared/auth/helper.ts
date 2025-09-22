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
 * @returns The flow of the desired url.
 */
export const getUrlForFlow = (
  apiBaseUrl: string,
  flowType: string,
  params?: URLSearchParams,
): string => {
  const url = new URL(`${apiBaseUrl}/self-service/${flowType}/browser`);
  if (params) {
    params.forEach((value, key) => url.searchParams.set(key, value));
  }
  return url.toString();
};

/**
 * Handle a 403 error from Ory by redirecting to a 2FA (AAL2) login flow.
 *
 * @param apiBaseUrl - The Ory API base URL
 * @param currentUrl - The current page URL (used for return_to)
 * @returns A function that inspects an error and returns either:
 *          - a URL for initiating 2FA, or
 *          - null if the error does not require 2FA
 */
export const maybeInitiate2FA = (apiBaseUrl: string, currentUrl: string) => (err: any) => {
  // 403 means we need to request 2FA
  if (err.response && err.response.status === 403) {
    const return_to = currentUrl;
    return getUrlForFlow(
      apiBaseUrl,
      'login',
      new URLSearchParams({
        aal: 'aal2',
        return_to,
      }),
    );
  }
  return null;
};
