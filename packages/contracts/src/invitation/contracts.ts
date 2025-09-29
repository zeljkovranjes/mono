// contracts/invitations.contract.ts
import z from 'zod';

import {
  InvitationSchema,
  CreateInvitationSchema,
  UpdateInvitationSchema,
  InvitationScopeSchema,
  InvitationStatusSchema,
} from './schema';
import {
  PaginationQuerySchema,
  createPaginatedResponse,
  GatewayHeadersSchema,
  createApiResponse,
  ApiContract,
} from '../base.schema';

export const InvitationListQuerySchema = PaginationQuerySchema.merge(
  z.object({
    scope: InvitationScopeSchema.optional(),
    organization_id: z.uuid().optional(),
    project_id: z.uuid().optional(),
    status: InvitationStatusSchema.optional(),
    email: z.email().optional(),
  }),
);

export const InvitationsContract = {
  list: {
    method: 'GET',
    path: '/api/invitations',
    query: InvitationListQuerySchema,
    response: createPaginatedResponse(InvitationSchema),
    description: 'List invitations with optional filters.',
  },

  create: {
    method: 'POST',
    path: '/api/invitations',
    headers: GatewayHeadersSchema,
    body: CreateInvitationSchema,
    response: createApiResponse(InvitationSchema),
    description: 'Create invitation for organization or project scope.',
  },

  get: {
    method: 'GET',
    path: '/api/invitations/:id',
    params: z.object({ id: z.uuid() }),
    response: createApiResponse(InvitationSchema),
    description: 'Get invitation by ID.',
  },

  getByToken: {
    method: 'GET',
    path: '/api/invitations/token/:token',
    params: z.object({ token: z.string().min(16).max(255) }),
    response: createApiResponse(InvitationSchema),
    description: 'Get invitation by token (for acceptance flows).',
  },

  update: {
    method: 'PUT',
    path: '/api/invitations/:id',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    body: UpdateInvitationSchema,
    response: createApiResponse(InvitationSchema),
    description: 'Update invitation (status, role, expires_at, metadata…).',
  },

  acceptByToken: {
    method: 'POST',
    path: '/api/invitations/accept',
    body: z.object({
      token: z.string().min(16).max(255),
      invitee_user_id: z.uuid().optional(),
    }),
    response: createApiResponse(
      z.object({
        accepted: z.boolean(),
        invitation: InvitationSchema.optional(),
      }),
    ),
    description: 'Accept an invitation using its token.',
  },

  revoke: {
    method: 'POST',
    path: '/api/invitations/:id/revoke',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    body: z.object({
      reason: z.string().max(1024).optional(),
    }),
    response: createApiResponse(
      z.object({
        revoked: z.boolean(),
        invitation: InvitationSchema.optional(),
      }),
    ),
    description: 'Revoke a pending invitation.',
  },

  resend: {
    method: 'POST',
    path: '/api/invitations/:id/resend',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    body: z.object({
      email: z.email().optional(),
    }),
    response: createApiResponse(
      z.object({
        sent: z.boolean(),
      }),
    ),
    description: 'Resend invitation email/notification.',
  },

  delete: {
    method: 'DELETE',
    path: '/api/invitations/:id',
    headers: GatewayHeadersSchema,
    params: z.object({ id: z.uuid() }),
    response: createApiResponse(z.object({ deleted: z.boolean() })),
    description: 'Hard-delete an invitation (usually after revocation/expiry).',
  },
} satisfies Record<string, ApiContract>;
