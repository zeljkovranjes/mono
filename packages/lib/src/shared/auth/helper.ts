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
