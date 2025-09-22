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
