import { maybeInitiate2FA } from '../../../shared/auth/helper';
import { getServerConfig } from '../../env/runtime';
import { getOryBaseUrl, getOryFrontend, getOryPermissions } from '../ory';
import { FastifyRequest, FastifyReply } from 'fastify';

let frontend = getOryFrontend();
let permissions = getOryPermissions();

/**
 * Middleware that prevents users with no valid from accessing
 * routes like `/dashboard` or `/organization`.
 *
 * - If session exists → redirect to `redirectTo`
 * - If no session → allow access
 */
export async function requireAuthMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const cookieHeader = req.headers.cookie ?? '';

  try {
    const { data: session } = await frontend.toSession({ cookie: cookieHeader });
    (req as any).session = session;
  } catch (err: any) {
    reply.redirect(`${getOryBaseUrl()}/self-service/login/browser`, 302);
  }
}

/**
 * Middleware that prevents logged-in users from accessing
 * routes like `/login` or `/register`.
 *
 * - If session exists → redirect to `redirectTo`
 * - If no session → allow access
 */
export async function requireNoAuthMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
  redirectTo = '/',
) {
  const cookieHeader = req.headers.cookie ?? '';

  try {
    // If session exists, redirect user away
    await frontend.toSession({ cookie: cookieHeader });
    reply.redirect(redirectTo, 302);
  } catch {
    // No session → continue to route handler
  }
}

/**
 * Middleware that validates an Ory session from the request.
 *
 * - Extracts cookies from the incoming request
 * - Calls Ory Kratos `toSession` to validate session
 * - If valid, attaches the session to the request context (event.locals.session)
 * - If invalid and requires 2FA, issues a redirect to the AAL2 login flow
 * - Otherwise returns null (let downstream handler decide what to do)
 *
 * @deprecated Needs to be redone.
 */

/**
 * Fastify preHandler that attaches an Ory session to the request
 * or redirects to login / 2FA if not authenticated.
 *
 * @param req   The incoming Fastify request
 * @param reply The Fastify reply
 */

export async function setSession(req: FastifyRequest, reply: FastifyReply) {
  const cookieHeader = req.headers.cookie ?? '';
  const url = new URL(req.url, `${req.protocol}://${req.hostname}`);
  const pathname = url.pathname;
  const search = url.search;

  try {
    const { data: session } = await frontend.toSession({ cookie: cookieHeader });

    // Attach session to request for downstream handlers
    (req as any).session = session;
  } catch (err: any) {
    const baseUrl = getOryBaseUrl();
    if (!baseUrl) {
      reply.code(500).send('Server misconfigured: missing Ory base URL');
      return;
    }

    // Check if error means 2FA is required
    const redirectUrl = maybeInitiate2FA(baseUrl, pathname + search, err);
    if (redirectUrl) {
      reply.redirect(redirectUrl);
      return;
    }

    // Otherwise redirect to login
    reply.redirect(`${baseUrl}/self-service/login/browser`);
  }
}

/**
 * Middleware that requires a valid Ory session and a Keto permission check
 * before letting the request continue.
 *
 * @param relation - The relation to check (e.g. "view", "edit")
 * @param namespace - The namespace (e.g. "Organization", "Dashboard")
 * @param objectResolver - Function to resolve the object ID from the request
 * @param onDeny - Optional callback for deny handling (default → 403)
 */
export function requirePermissionMiddleware(
  relation: string,
  namespace: string,
  objectResolver: (req: FastifyRequest) => string | Promise<string>,
) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    const cookieHeader = req.headers.cookie ?? '';

    try {
      // 1. Validate session
      const { data: session } = await frontend.toSession({ cookie: cookieHeader });
      (req as any).session = session;

      // 2. Resolve object dynamically
      const objectId = await objectResolver(req);

      // 3. Check permission in Keto
      const { data: result } = await permissions.checkPermission({
        subjectId: session.identity!.id,
        relation,
        namespace,
        object: objectId,
      });

      if (!result.allowed) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Missing required permission',
          relation,
          namespace,
          object: objectId,
        });
      }
    } catch (err: any) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing session',
        cause: err?.message ?? err,
      });
    }
  };
}

/**
 * Require a valid shared secret for a route.
 *
 * - If `expectedSecret` is provided → use that.
 * - Otherwise → fallback to config.API_SECRET_KEY.
 *
 */
export function requireSecretMiddleware(expectedSecret?: string) {
  const secretToCheck = expectedSecret ?? getServerConfig().API_SECRET_KEY;

  return async function (req: FastifyRequest, reply: FastifyReply) {
    const authHeader = req.headers['authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header',
      });
    }

    const provided = authHeader.slice('Bearer '.length).trim();

    if (provided !== secretToCheck) {
      return reply.status(403).send({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header',
      });
    }
  };
}
