// src/server/db/postgres/repo/invitation.repo.ts
import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';

import {
  Invitation,
  InvitationSchema,
  CreateInvitation,
  CreateInvitationSchema,
  UpdateInvitation,
  UpdateInvitationSchema,
} from '@safeoutput/contracts/invitation/schema';

/**
 * Create a new invitation.
 *
 * @example
 * ```ts
 * const invite = await createInvitation({
 *   scope: "organization",
 *   organization_id: "org-uuid",
 *   inviter_user_id: "user-uuid",
 *   invitee_email: "test@example.com",
 *   token: "secureRandomToken",
 * });
 * ```
 *
 * @internal
 */
export async function createInvitation(data: CreateInvitation): Promise<Invitation> {
  const validated = CreateInvitationSchema.parse(data);
  const now = new Date().toISOString();

  const newInvitation = await db
    .insertInto('invitation')
    .values({
      id: randomUUID(),
      scope: validated.scope,
      organization_id: validated.organization_id ?? null,
      project_id: validated.project_id ?? null,
      inviter_user_id: validated.inviter_user_id,
      invitee_email: validated.invitee_email,
      invitee_user_id: validated.invitee_user_id ?? null,
      role: validated.role ?? null,
      token: validated.token,
      status: validated.status,
      expires_at: validated.expires_at ?? null,
      metadata: (validated.metadata ?? {}) as JsonObject,
      created_at: now,
      updated_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return InvitationSchema.parse(newInvitation);
}

/**
 * Get an invitation by ID.
 *
 * @example
 * ```ts
 * const invite = await getInvitationById("inv-uuid");
 * ```
 *
 * @internal
 */
export async function getInvitationById(id: string): Promise<Invitation | null> {
  const row = await db.selectFrom('invitation').selectAll().where('id', '=', id).executeTakeFirst();
  return row ? InvitationSchema.parse(row) : null;
}

/**
 * Get an invitation by token.
 *
 * @example
 * ```ts
 * const invite = await getInvitationByToken("secureRandomToken");
 * ```
 *
 * @internal
 */
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const row = await db
    .selectFrom('invitation')
    .selectAll()
    .where('token', '=', token)
    .executeTakeFirst();

  return row ? InvitationSchema.parse(row) : null;
}

/**
 * List invitations for a specific organization.
 *
 * @example
 * ```ts
 * const invites = await listInvitationsByOrganization("org-uuid", 20, 0);
 * ```
 *
 * @internal
 */
export async function listInvitationsByOrganization(
  organizationId: string,
  limit = 50,
  offset = 0,
): Promise<Invitation[]> {
  const rows = await db
    .selectFrom('invitation')
    .selectAll()
    .where('organization_id', '=', organizationId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => InvitationSchema.parse(row));
}

/**
 * List invitations for a specific project.
 *
 * @example
 * ```ts
 * const invites = await listInvitationsByProject("proj-uuid", 20, 0);
 * ```
 *
 * @internal
 */
export async function listInvitationsByProject(
  projectId: string,
  limit = 50,
  offset = 0,
): Promise<Invitation[]> {
  const rows = await db
    .selectFrom('invitation')
    .selectAll()
    .where('project_id', '=', projectId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => InvitationSchema.parse(row));
}

/**
 * Update an invitation.
 *
 * @example
 * ```ts
 * const updated = await updateInvitation("inv-uuid", { status: "accepted" });
 * ```
 *
 * @internal
 */
export async function updateInvitation(
  id: string,
  data: UpdateInvitation,
): Promise<Invitation | null> {
  const validated = UpdateInvitationSchema.parse(data);

  const updated = await db
    .updateTable('invitation')
    .set({
      ...(validated.status && { status: validated.status }),
      ...(validated.invitee_user_id && { invitee_user_id: validated.invitee_user_id }),
      ...(validated.role && { role: validated.role }),
      ...(validated.expires_at !== undefined && { expires_at: validated.expires_at }),
      ...(validated.metadata && { metadata: validated.metadata as JsonObject }),
      updated_at: new Date().toISOString(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  return updated ? InvitationSchema.parse(updated) : null;
}

/**
 * Delete an invitation by ID.
 *
 * @example
 * ```ts
 * const deleted = await deleteInvitation("inv-uuid");
 * ```
 *
 * @internal
 */
export async function deleteInvitation(id: string): Promise<boolean> {
  const res = await db.deleteFrom('invitation').where('id', '=', id).executeTakeFirst();
  return (res.numDeletedRows ?? 0) > 0;
}
