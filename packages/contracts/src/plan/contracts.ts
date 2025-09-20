import z from 'zod';

import { PlanSchema, CreatePlanSchema, UpdatePlanSchema } from './schema';
import {
  PaginationQuerySchema,
  createPaginatedResponse,
  GatewayHeadersSchema,
  createApiResponse,
  ApiContract,
} from '../base.schema';

export const PlansContract = {
  list: {
    method: 'GET',
    path: '/api/plans',
    query: PaginationQuerySchema,
    response: createPaginatedResponse(PlanSchema),
    description: 'List plans',
  },

  create: {
    method: 'POST',
    path: '/api/plans',
    headers: GatewayHeadersSchema,
    body: CreatePlanSchema,
    response: createApiResponse(PlanSchema),
    description: 'Create plan',
  },

  get: {
    method: 'GET',
    path: '/api/plans/:id',
    params: z.object({ id: z.uuid() }),
    response: createApiResponse(PlanSchema),
    description: 'Get plan',
  },

  update: {
    method: 'PUT',
    path: '/api/plans/:id',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    body: UpdatePlanSchema,
    response: createApiResponse(PlanSchema),
    description: 'Update plan',
  },

  delete: {
    method: 'DELETE',
    path: '/api/plans/:id',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    response: createApiResponse(z.object({ deleted: z.boolean() })),
    description: 'Delete plan',
  },
} satisfies Record<string, ApiContract>;
