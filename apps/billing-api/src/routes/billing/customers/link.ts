/**
 * Registers the `/billing/link` route for the billing service.
 *
 * This endpoint links an Ory identity to a Stripe customer by:
 *  - Creating a Stripe customer record using the identity’s email/name.
 *  - Saving the Stripe customer ID into the Ory identity’s `metadata_admin`.
 *
 * Security:
 *  - Requires a valid secret via {@link requireSecretMiddleware}.
 *
 * @route POST /billing/link
 * @security BearerToken
 * @returns 200 - Success (no response body)
 *
 * Example response:
 * ```
 * HTTP/1.1 200 OK
 * ```
 */

import { requireSecretMiddleware } from '@safeoutput/lib/server/auth/middleware/fastify';
import { getOryIdentity } from '@safeoutput/lib/server/auth/ory';
import { billing } from '@safeoutput/lib/server/billing/index';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

type LinkPayload = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
};

interface LinkRoute {
  Body: LinkPayload;
}

const identity = getOryIdentity();

export default async function registerRoute(fastify: FastifyInstance) {
  fastify.post<LinkRoute>(
    '/link',
    {
      preHandler: [requireSecretMiddleware()],
      schema: {
        body: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            avatar: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<LinkRoute>, reply: FastifyReply) => {
      const { id, email, name, avatar } = request.body;

      const { data: oryUser } = await identity.getIdentity({ id });
      const customer = await billing.createCustomer({
        // alternatively could use the name from the payload.
        name: `${oryUser.traits.name?.first || ''} ${oryUser.traits.name?.last || ''}`.trim(),
        email: email,
        metadata: {
          ory_id: id,
        },
      });

      const newMetadata = {
        ...(oryUser.metadata_admin || {}),
        stripe_customer_id: customer.id,
      };

      await identity.updateIdentity({
        id: oryUser.id,
        // @ts-ignore
        updateIdentityBody: {
          traits: oryUser.traits,
          schema_id: oryUser.schema_id,
          metadata_admin: newMetadata,
        },
      });
      return reply.status(200).send();
    },
  );
}
