import { IdentityApi, OAuth2Api, PermissionApi, RelationshipApi, Configuration } from '@ory/client';
import { getServerConfig } from '../../server/env/runtime';
import { getOryBaseUrl } from '../../shared/auth/helper';

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
 * - Checking fine-grained access control (ACL) permissions
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
