import z from 'zod';

import { ProjectSchema, CreateProjectSchema, UpdateProjectSchema } from './schema';
import {
  GatewayHeadersSchema,
  PaginationQuerySchema,
  createPaginatedResponse,
  createApiResponse,
  ApiContract,
} from '../base.schema';

export const ProjectsContract = {
  list: {
    method: 'GET',
    path: '/api/organizations/:organization_id/projects',
    headers: GatewayHeadersSchema,
    params: z.object({ organization_id: z.uuid() }),
    query: PaginationQuerySchema,
    response: createPaginatedResponse(ProjectSchema),
    description: 'List projects for organization',
  },

  create: {
    method: 'POST',
    path: '/api/organizations/:organization_id/projects',
    headers: GatewayHeadersSchema,
    params: z.object({ organization_id: z.uuid() }),
    body: CreateProjectSchema.omit({ organization_id: true }),
    response: createApiResponse(ProjectSchema),
    description: 'Create project',
  },

  get: {
    method: 'GET',
    path: '/api/projects/:project_id',
    headers: GatewayHeadersSchema,
    params: z.object({ project_id: z.uuid() }),
    response: createApiResponse(ProjectSchema),
    description: 'Get project',
  },

  update: {
    method: 'PUT',
    path: '/api/projects/:project_id',
    headers: GatewayHeadersSchema,
    params: z.object({ project_id: z.uuid() }),
    body: UpdateProjectSchema,
    response: createApiResponse(ProjectSchema),
    description: 'Update project',
  },

  delete: {
    method: 'DELETE',
    path: '/api/projects/:project_id',
    headers: GatewayHeadersSchema,
    params: z.object({ project_id: z.uuid() }),
    response: createApiResponse(z.object({ deleted: z.boolean() })),
    description: 'Delete project',
  },
} satisfies Record<string, ApiContract>;
