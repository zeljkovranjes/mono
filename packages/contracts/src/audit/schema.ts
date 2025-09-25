import { z } from 'zod';

export const AuditLogSchema = z.object({
  id: z.uuid(),
  actor_id: z.uuid().nullable(),
  entity_type: z.string().max(255),
  entity_id: z.uuid(),
  event_type: z.string().max(255),
  diff: z.record(z.string(), z.unknown()),
  context: z.record(z.string(), z.unknown()).default({}),
  created_at: z.iso.datetime(),
});

export const CreateAuditLogSchema = z.object({
  actor_id: z.uuid().optional(),
  entity_type: z.string().max(255),
  entity_id: z.uuid(),
  event_type: z.string().max(255),
  diff: z.record(z.string(), z.unknown()),
  context: z.record(z.string(), z.unknown()).optional().default({}),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;
