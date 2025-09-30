import z from 'zod';

export const StripeSubscriptionStatusSchema = z
  .enum([
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused',
  ])
  .nullable();

export const OrganizationTypeSchema = z.enum([
  'Personal',
  'Educational',
  'Startup',
  'Agency',
  'Government',
  'Other',
]);

export const OrganizationSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  type: OrganizationTypeSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
  subscription_status: StripeSubscriptionStatusSchema.nullable(),
  current_plan_id: z.uuid().nullable(),
  created_at: z
    .union([z.string(), z.date()])
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
  updated_at: z
    .union([z.string(), z.date()])
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
});

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  type: OrganizationTypeSchema,
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  current_plan_id: z.uuid().optional(),
});

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  type: OrganizationTypeSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  subscription_status: StripeSubscriptionStatusSchema.nullable().optional(),
  current_plan_id: z.uuid().nullable().optional(),
});

export const OrganizationMemberSchema = z.object({
  organization_id: z.uuid(),
  user_id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const AddMemberSchema = z.object({
  user_id: z.uuid(),
});

export const RemoveMemberSchema = z.object({
  user_id: z.uuid(),
  organization_id: z.uuid(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;

export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
export type AddMember = z.infer<typeof AddMemberSchema>;
export type RemoveMember = z.infer<typeof RemoveMemberSchema>;

export type OrganizationWithMembers = Organization & {
  members: OrganizationMember[];
  member_count: number;
};
