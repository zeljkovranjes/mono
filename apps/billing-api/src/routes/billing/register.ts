import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default async function registerRoute(fastify: FastifyInstance) {
  fastify.get('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      status: 'ok',
      message: 'Billing service is running',
      timestamp: new Date().toISOString(),
      service: 'billing-api',
    };
  });
}
