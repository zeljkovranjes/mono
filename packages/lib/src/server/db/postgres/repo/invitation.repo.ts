// src/server/db/postgres/repo/invitation.repo.ts
import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';
import type { Kysely, Transaction } from 'kysely';
import type { DB } from '../../types/pg-database-types';

import {
  Invitation,
  InvitationSchema,
  CreateInvitation,
  CreateInvitationSchema,
  UpdateInvitation,
  UpdateInvitationSchema,
} from '@safeoutput/contracts/invitation/schema';

type Executor = Kysely<DB> | Transaction<DB>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeInvitation(invitation: any): any {
  return {
    ...invitation,
    created_at:
      invitation.created_at instanceof Date
        ? invitation.created_at.toISOString()
        : invitation.created_at,
    updated_at:
      invitation.updated_at instanceof Date
        ? invitation.updated_at.toISOString()
        : invitation.updated_at,
    expires_at:
      invitation.expires_at instanceof Date
        ? invitation.expires_at.toISOString()
        : invitation.expires_at,
  };
}

/**
 * Create a new invitation.
 *
 * @internal
 * @param data - The invitation creation payload.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The newly created invitation.
 */
export async function createInvitation(
  data: CreateInvitation,
  executor: Executor = db,
): Promise<Invitation> {
  const validated = CreateInvitationSchema.parse(data);
  const now = new Date().toISOString();

  const newInvitation = await executor
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

  return InvitationSchema.parse(normalizeInvitation(newInvitation));
}

/**
 * Get an invitation by ID.
 *
 * @internal
 * @param id - The invitation ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The invitation if found, otherwise null.
 */
export async function getInvitationById(
  id: string,
  executor: Executor = db,
): Promise<Invitation | null> {
  const row = await executor
    .selectFrom('invitation')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return row ? InvitationSchema.parse(normalizeInvitation(row)) : null;
}

/**
 * Get an invitation by token.
 *
 * @internal
 * @param token - The invitation token.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The invitation if found, otherwise null.
 */
export async function getInvitationByToken(
  token: string,
  executor: Executor = db,
): Promise<Invitation | null> {
  const row = await executor
    .selectFrom('invitation')
    .selectAll()
    .where('token', '=', token)
    .executeTakeFirst();

  return row ? InvitationSchema.parse(normalizeInvitation(row)) : null;
}

/**
 * List invitations for a specific organization.
 *
 * @internal
 * @param organizationId - The organization ID.
 * @param limit - Maximum number of invitations to return.
 * @param offset - Number of invitations to skip before returning results.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of invitations for the organization.
 */
export async function listInvitationsByOrganization(
  organizationId: string,
  limit = 50,
  offset = 0,
  executor: Executor = db,
): Promise<Invitation[]> {
  const rows = await executor
    .selectFrom('invitation')
    .selectAll()
    .where('organization_id', '=', organizationId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => InvitationSchema.parse(normalizeInvitation(row)));
}

/**
 * List invitations for a specific project.
 *
 * @internal
 * @param projectId - The project ID.
 * @param limit - Maximum number of invitations to return.
 * @param offset - Number of invitations to skip before returning results.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of invitations for the project.
 */
export async function listInvitationsByProject(
  projectId: string,
  limit = 50,
  offset = 0,
  executor: Executor = db,
): Promise<Invitation[]> {
  const rows = await executor
    .selectFrom('invitation')
    .selectAll()
    .where('project_id', '=', projectId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => InvitationSchema.parse(normalizeInvitation(row)));
}

/**
 * Update an invitation.
 *
 * @internal
 * @param id - The invitation ID.
 * @param data - Partial update payload for the invitation.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The updated invitation if found, otherwise null.
 */
export async function updateInvitation(
  id: string,
  data: UpdateInvitation,
  executor: Executor = db,
): Promise<Invitation | null> {
  const validated = UpdateInvitationSchema.parse(data);

  const updated = await executor
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

  return updated ? InvitationSchema.parse(normalizeInvitation(updated)) : null;
}

/**
 * Delete an invitation by ID.
 *
 * @internal
 * @param id - The invitation ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns True if the invitation was deleted, otherwise false.
 */
export async function deleteInvitation(id: string, executor: Executor = db): Promise<boolean> {
  const res = await executor.deleteFrom('invitation').where('id', '=', id).executeTakeFirst();
  return (res.numDeletedRows ?? 0) > 0;
}
