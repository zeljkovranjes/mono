// POST /api/organizations

import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createOrganizationWithOwner } from '@safeoutput/lib/server/service/organization.service';
import { AppError, toOkResponse } from '@safeoutput/lib/shared/utils/response';
import { OrganizationsContract } from '@safeoutput/contracts/organization/contract';
import { requireAuthMiddleware } from '@safeoutput/lib/server/auth/middleware/fastify';

const createOrganizationRoute: FastifyPluginAsync = async (fastify) => {
  const contract = OrganizationsContract.create;

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: contract.method,
    url: '/',
    schema: contract.schema,
    preHandler: [requireAuthMiddleware],
    handler: async (request, reply) => {
      const session = (request as any).session;
      const userId = session?.identity?.id;

      try {
        const { current_plan_id, metadata, ...safeBody } = request.body;

        const organization = await createOrganizationWithOwner(userId, safeBody);

        return reply
          .code(201)
          .send(
            toOkResponse(
              '/api/organizations',
              'Organization created successfully',
              201,
              organization,
            ),
          );
      } catch (error) {
        request.log.error({ error, userId, body: request.body }, 'Failed to create organization');

        if (
          error instanceof Error &&
          (error.message.includes('duplicate') || error.message.includes('unique'))
        ) {
          throw AppError.conflict(
            'Organization with this slug already exists',
            '/api/organizations',
          );
        }

        throw AppError.internal('Failed to create organization', '/api/organizations');
      }
    },
  });
};

export default createOrganizationRoute;
