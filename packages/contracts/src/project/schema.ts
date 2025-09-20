import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  organization_id: z.uuid(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  organization_id: z.uuid(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
