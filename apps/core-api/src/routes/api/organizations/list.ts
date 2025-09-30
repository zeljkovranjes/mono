// GET /api/organizations/list/mine

import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { listUserOrganizations } from '@safeoutput/lib/server/service/organizationMember.service';
import { requireAuthMiddleware } from '@safeoutput/lib/server/auth/middleware/fastify';
import { toOkResponse } from '@safeoutput/lib/shared/utils/response';

const listMyOrganizationsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/list/mine',
    preHandler: [requireAuthMiddleware],
    handler: async (request, reply) => {
      const session = (request as any).session;
      const userId = session?.identity?.id;
      const organizations = await listUserOrganizations(userId);

      return reply
        .code(200)
        .send(
          toOkResponse(
            '/api/organizations/mine',
            'Organizations fetched successfully',
            200,
            organizations,
          ),
        );
    },
  });
};

export default listMyOrganizationsRoute;
