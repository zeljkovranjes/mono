import { z } from 'zod';

export const AuditLogSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  entity_type: z.string().max(255),
  entity_id: z.uuid(),
  event_type: z.string().max(255),
  diff: z.record(z.string(), z.unknown()),
  created_at: z.iso.datetime(),
});

export const CreateAuditLogSchema = z.object({
  user_id: z.uuid(),
  entity_type: z.string().max(255),
  entity_id: z.uuid(),
  event_type: z.string().max(255),
  diff: z.record(z.string(), z.unknown()),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;
