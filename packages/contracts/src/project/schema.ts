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

export const ProjectMemberSchema = z.object({
  id: z.uuid(),
  project_id: z.uuid(),
  user_id: z.uuid(),
});

export const CreateProjectMemberSchema = z.object({
  project_id: z.uuid(),
  user_id: z.uuid(),
});

export const DeleteProjectMemberSchema = z.object({
  project_id: z.uuid(),
  user_id: z.uuid(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;
export type CreateProjectMember = z.infer<typeof CreateProjectMemberSchema>;
export type DeleteProjectMember = z.infer<typeof DeleteProjectMemberSchema>;
