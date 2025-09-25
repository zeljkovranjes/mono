import {
  IdentityApi,
  OAuth2Api,
  PermissionApi,
  RelationshipApi,
  Configuration,
  FrontendApi,
} from '@ory/client';
import { getServerConfig } from '../../server/env/runtime';

/**
 * Returns the best ORY base URL depending on runtime (SERVER VARIANT).
 *
 * Priority order:
 *   1. VITE_KRATOS_BROWSER_URL
 *   2. VITE_KRATOS_PUBLIC_URL
 *   3. VITE_ORY_SDK_URL
 *   4. fallback playground URL
 */
export function getOryBaseUrl(): string {
  const config = getServerConfig();

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

/**
 * Create an Ory Identity API client for server-side interactions.
 *
 * Typical usage:
 * - Managing identities (create, update, delete)
 * - Querying identity information
 *
 * @returns A configured instance of `IdentityApi`.
 */
export function getOryIdentity() {
  return new IdentityApi(
    new Configuration({
      basePath: getServerConfig().VITE_KRATOS_ADMIN_URL || getOryBaseUrl(),
      ...(getServerConfig().ORY_ADMIN_API_TOKEN && {
        accessToken: getServerConfig().ORY_ADMIN_API_TOKEN,
      }),
    }),
  );
}

/**
 * Create an Ory OAuth2 (Hydra) API client for server-side interactions.
 *
 * Typical usage:
 * - Managing OAuth2 clients
 * - Introspecting and revoking tokens
 * - Handling consent/login challenges
 *
 * @returns A configured instance of `OAuth2Api`.
 */
export function getOryOAuth2() {
  return new OAuth2Api(
    new Configuration({
      basePath: getServerConfig().VITE_HYDRA_ADMIN_URL || getOryBaseUrl(),
      ...(getServerConfig().ORY_ADMIN_API_TOKEN && {
        accessToken: getServerConfig().ORY_ADMIN_API_TOKEN,
      }),
      ...(getServerConfig().MOCK_TLS_TERMINATION && {
        baseOptions: { headers: { 'X-Forwarded-Proto': 'https' } },
      }),
    }),
  );
}

/**
 * Create an Ory Keto Permissions API client.
 *
 * Typical usage:
 * - Checking fine-grained access control permissions
 *
 * @returns A configured instance of `PermissionApi`.
 */
export function getOryPermissions() {
  return new PermissionApi(
    new Configuration({
      basePath: getServerConfig().VITE_KETO_PUBLIC_URL || getOryBaseUrl(),
      ...(getServerConfig().ORY_ADMIN_API_TOKEN && {
        accessToken: getServerConfig().ORY_ADMIN_API_TOKEN,
      }),
    }),
  );
}

/**
 * Create an Ory Keto Relationships API client.
 *
 * Typical usage:
 * - Managing relationships for access control
 * - Defining who can do what on resources
 *
 * @returns A configured instance of `RelationshipApi`.
 */
export function getOryRelationships() {
  return new RelationshipApi(
    new Configuration({
      basePath: getServerConfig().VITE_KETO_PUBLIC_URL || getOryBaseUrl(),
      ...(getServerConfig().ORY_ADMIN_API_TOKEN && {
        accessToken: getServerConfig().ORY_ADMIN_API_TOKEN,
      }),
    }),
  );
}
