import { requireSecretMiddleware } from '@safeoutput/lib/server/auth/middleware/fastify';
import { getStripe } from '@safeoutput/lib/server/billing/stripe/sdk';
import { getServerConfig } from '@safeoutput/lib/server/env/runtime';
import { getLogger } from '@safeoutput/lib/server/logging/index';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const stripe = getStripe();
const config = getServerConfig();
const logger = getLogger();

export default async function registerRoute(fastify: FastifyInstance) {
  fastify.post(
    '/webhook',
    {
      preHandler: [requireSecretMiddleware()],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const sig = request.headers['stripe-signature'];
      if (!sig || Array.isArray(sig)) {
        logger.warn({ headers: request.headers }, 'Missing or invalid Stripe-Signature header');
        return reply.status(400);
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          (request as any).rawBody,
          sig,
          config.STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        logger.error({ err }, 'Webhook signature verification failed');
        return reply.status(400).send(`Webhook Error: ${(err as Error).message}`);
      }

      switch (event.type) {
        case 'checkout.session.completed':
          break;
        case 'customer.subscription.updated':
          break;
        case 'customer.subscription.deleted':
          break;
        case 'charge.refunded':
          break;
        case 'product.created':
          break;
        case 'product.updated':
          break;
        case 'product.deleted':
          break;
        case 'price.created':
          break;
        case 'price.updated':
          break;
        default:
          logger.debug({ type: event.type }, 'Unhandled event type');
          break;
      }

      return reply.status(200).send();
    },
  );
}
