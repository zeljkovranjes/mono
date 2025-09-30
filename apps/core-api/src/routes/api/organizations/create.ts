import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createOrganizationWithOwner } from '@safeoutput/lib/server/service/organization.service';
import { AppError, toOkResponse } from '@safeoutput/lib/shared/utils/response';
import { OrganizationsContract } from '@safeoutput/contracts/organization/contract';

const createOrganizationRoute: FastifyPluginAsync = async (fastify) => {
  const contract = OrganizationsContract.create;

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: contract.method,
    url: '/', // because the file lives under routes/api/organizations
    schema: contract.schema,
    handler: async (request, reply) => {
      const userId = request.headers['x-user-id'];
      if (!userId || typeof userId !== 'string') {
        throw AppError.unauthorized('User ID is required', '/api/organizations');
      }

      try {
        const organization = await createOrganizationWithOwner(userId, request.body);

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
