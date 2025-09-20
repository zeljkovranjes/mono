import { z } from 'zod';
import { AuditLogSchema, CreateAuditLogSchema } from './schema';
import {
  GatewayHeadersSchema,
  PaginationQuerySchema,
  createPaginatedResponse,
  createApiResponse,
  ApiContract,
} from '../base.schema';

export const AuditLogsContract = {
  list: {
    method: 'GET',
    path: '/api/audit-logs',
    headers: GatewayHeadersSchema,
    query: PaginationQuerySchema.extend({
      entity_type: z.string().optional(),
      entity_id: z.uuid().optional(),
      event_type: z.string().optional(),
      user_id: z.uuid().optional(),
    }),
    response: createPaginatedResponse(AuditLogSchema),
    description: 'List audit logs',
  },

  create: {
    method: 'POST',
    path: '/api/audit-logs',
    headers: GatewayHeadersSchema,
    body: CreateAuditLogSchema,
    response: createApiResponse(AuditLogSchema),
    description: 'Create audit log entry',
  },

  get: {
    method: 'GET',
    path: '/api/audit-logs/:id',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    response: createApiResponse(AuditLogSchema),
    description: 'Get audit log entry',
  },

  deleteOld: {
    method: 'DELETE',
    path: '/api/audit-logs/cleanup',
    headers: GatewayHeadersSchema,
    query: z.object({
      older_than: z.iso.datetime(),
    }),
    response: createApiResponse(z.object({ count: z.number() })),
    description: 'Deletes all audit logs older than a specified date.',
  },

  deleteSpecificOld: {
    method: 'DELETE',
    path: '/api/audit-logs/cleanup/specific',
    headers: GatewayHeadersSchema,
    query: z.object({
      older_than: z.iso.datetime(),
      entity_type: z.string(),
      event_type: z.string(),
    }),
    response: createApiResponse(z.object({ count: z.number() })),
    description: 'Deletes specific audit logs based on their type and creation date.',
  },
} satisfies Record<string, ApiContract>;
