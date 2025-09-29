import { z } from 'zod';

export const InvitationScopeSchema = z.enum(['organization', 'project']);
export const InvitationStatusSchema = z.enum(['pending', 'accepted', 'revoked', 'expired']);

export const InvitationSchema = z
  .object({
    id: z.uuid(),
    scope: InvitationScopeSchema,
    organization_id: z.uuid().nullable(), // required when scope=organization
    project_id: z.uuid().nullable(), // required when scope=project
    inviter_user_id: z.uuid(), // Ory identity
    invitee_email: z.string().email().max(320),
    invitee_user_id: z.uuid().nullable(), // set on acceptance (if the email maps to a user)
    role: z.string().max(64).nullable(), // e.g., 'owner'|'admin'|'member'|'viewer'
    token: z.string().min(16).max(255), // secure random string
    status: InvitationStatusSchema,
    expires_at: z.iso.datetime().nullable(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
  })
  .refine(
    (v) =>
      (v.scope === 'organization' && !!v.organization_id && !v.project_id) ||
      (v.scope === 'project' && !!v.project_id),
    {
      message:
        'scope/ids mismatch: organization requires organization_id only; project requires project_id',
    },
  );

export const CreateInvitationSchema = z
  .object({
    scope: InvitationScopeSchema,
    organization_id: z.string().uuid().optional(),
    project_id: z.string().uuid().optional(),
    inviter_user_id: z.string().uuid(),
    invitee_email: z.string().email().max(320),
    invitee_user_id: z.string().uuid().optional(),
    role: z.string().max(64).optional(),
    token: z.string().min(16).max(255),
    status: InvitationStatusSchema.default('pending'),
    expires_at: z.iso.datetime().optional(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .refine(
    (v) =>
      (v.scope === 'organization' && !!v.organization_id && !v.project_id) ||
      (v.scope === 'project' && !!v.project_id),
    { message: 'scope/ids mismatch' },
  );

export const UpdateInvitationSchema = z.object({
  status: InvitationStatusSchema.optional(),
  invitee_user_id: z.string().uuid().optional(),
  role: z.string().max(64).optional(),
  expires_at: z.iso.datetime().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Invitation = z.infer<typeof InvitationSchema>;
export type CreateInvitation = z.infer<typeof CreateInvitationSchema>;
export type UpdateInvitation = z.infer<typeof UpdateInvitationSchema>;
