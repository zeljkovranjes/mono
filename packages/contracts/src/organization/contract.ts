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
    path: '/api/organizations',
    headers: GatewayHeadersSchema,
    query: PaginationQuerySchema.extend({
      type: OrganizationTypeSchema.optional(),
    }),
    response: createPaginatedResponse(OrganizationSchema),
    description: 'List organizations',
  },

  create: {
    method: 'POST',
    path: '/api/organizations',
    headers: GatewayHeadersSchema,
    body: CreateOrganizationSchema,
    response: createApiResponse(OrganizationSchema),
    description: 'Create organization',
  },

  get: {
    method: 'GET',
    path: '/api/organizations/:id',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    response: createApiResponse(OrganizationSchema),
    description: 'Get organization',
  },

  getBySlug: {
    method: 'GET',
    path: '/api/organizations/slug/:slug',
    headers: GatewayHeadersSchema,
    params: z.object({ slug: z.string() }),
    response: createApiResponse(OrganizationSchema),
    description: 'Get organization by slug',
  },

  update: {
    method: 'PUT',
    path: '/api/organizations/:id',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    body: UpdateOrganizationSchema,
    response: createApiResponse(OrganizationSchema),
    description: 'Update organization',
  },

  delete: {
    method: 'DELETE',
    path: '/api/organizations/:id',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    response: createApiResponse(z.object({ deleted: z.boolean() })),
    description: 'Delete organization',
  },
} satisfies Record<string, ApiContract>;

export const OrganizationMembersContract = {
  list: {
    method: 'GET',
    path: '/api/organizations/:organization_id/members',
    headers: GatewayHeadersSchema,
    params: z.object({ organization_id: z.uuid() }),
    query: PaginationQuerySchema,
    response: createPaginatedResponse(OrganizationMemberSchema),
    description: 'List organization members',
  },

  add: {
    method: 'POST',
    path: '/api/organizations/:organization_id/members',
    headers: GatewayHeadersSchema,
    params: z.object({ organization_id: z.uuid() }),
    body: AddMemberSchema,
    response: createApiResponse(OrganizationMemberSchema),
    description: 'Add member to organization',
  },

  remove: {
    method: 'DELETE',
    path: '/api/organizations/:organization_id/members/:user_id',
    headers: GatewayHeadersSchema,
    params: z.object({
      organization_id: z.uuid(),
      user_id: z.uuid(),
    }),
    response: createApiResponse(z.object({ removed: z.boolean() })),
    description: 'Remove member from organization',
  },
} satisfies Record<string, ApiContract>;
