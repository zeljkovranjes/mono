import z from 'zod';
import {
  OrganizationTypeSchema,
  OrganizationSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  AddMemberSchema,
  OrganizationMemberSchema,
} from './schema';
import {
  ApiContract,
  createApiResponse,
  createPaginatedResponse,
  GatewayHeadersSchema,
  PaginationQuerySchema,
} from '../base.schema';

export const OrganizationsContract = {
  list: {
    method: 'GET',
    path: '/',
    schema: {
      description: 'List organizations',
      tags: ['organizations'],
      headers: GatewayHeadersSchema,
      query: PaginationQuerySchema.extend({
        type: OrganizationTypeSchema.optional(),
      }),
      response: {
        200: createPaginatedResponse(OrganizationSchema),
      },
    },
  },

  create: {
    method: 'POST',
    path: '/',
    schema: {
      description: 'Create organization',
      tags: ['organizations'],
      headers: GatewayHeadersSchema,
      body: CreateOrganizationSchema,
      response: {
        201: createApiResponse(OrganizationSchema),
      },
    },
  },

  get: {
    method: 'GET',
    path: '/:id',
    schema: {
      description: 'Get organization',
      tags: ['organizations'],
      headers: GatewayHeadersSchema,
      params: z.object({ id: z.uuid() }),
      response: {
        200: createApiResponse(OrganizationSchema),
      },
    },
  },

  getBySlug: {
    method: 'GET',
    path: '/slug/:slug',
    schema: {
      description: 'Get organization by slug',
      tags: ['organizations'],
      headers: GatewayHeadersSchema,
      params: z.object({ slug: z.string() }),
      response: {
        200: createApiResponse(OrganizationSchema),
      },
    },
  },

  update: {
    method: 'PUT',
    path: '/:id',
    schema: {
      description: 'Update organization',
      tags: ['organizations'],
      headers: GatewayHeadersSchema,
      params: z.object({ id: z.uuid() }),
      body: UpdateOrganizationSchema,
      response: {
        200: createApiResponse(OrganizationSchema),
      },
    },
  },

  delete: {
    method: 'DELETE',
    path: '/:id',
    schema: {
      description: 'Delete organization',
      tags: ['organizations'],
      headers: GatewayHeadersSchema,
      params: z.object({ id: z.uuid() }),
      response: {
        200: createApiResponse(z.object({ deleted: z.boolean() })),
      },
    },
  },
} satisfies Record<string, ApiContract>;

export const OrganizationMembersContract = {
  list: {
    method: 'GET',
    path: '/:organization_id/members',
    schema: {
      description: 'List organization members',
      tags: ['organization-members'],
      headers: GatewayHeadersSchema,
      params: z.object({ organization_id: z.uuid() }),
      query: PaginationQuerySchema,
      response: {
        200: createPaginatedResponse(OrganizationMemberSchema),
      },
    },
  },

  add: {
    method: 'POST',
    path: '/:organization_id/members',
    schema: {
      description: 'Add member to organization',
      tags: ['organization-members'],
      headers: GatewayHeadersSchema,
      params: z.object({ organization_id: z.uuid() }),
      body: AddMemberSchema,
      response: {
        201: createApiResponse(OrganizationMemberSchema),
      },
    },
  },

  remove: {
    method: 'DELETE',
    path: '/:organization_id/members/:user_id',
    schema: {
      description: 'Remove member from organization',
      tags: ['organization-members'],
      headers: GatewayHeadersSchema,
      params: z.object({
        organization_id: z.uuid(),
        user_id: z.uuid(),
      }),
      response: {
        200: createApiResponse(z.object({ removed: z.boolean() })),
      },
    },
  },
} satisfies Record<string, ApiContract>;
