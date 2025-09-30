// src/server/services/invitation.service.ts
import {
  Invitation,
  CreateInvitation,
  UpdateInvitation,
} from '@safeoutput/contracts/invitation/schema';

import {
  createInvitation as createInvitationRepo,
  getInvitationById as getInvitationByIdRepo,
  getInvitationByToken as getInvitationByTokenRepo,
  listInvitationsByOrganization as listInvitationsByOrganizationRepo,
  listInvitationsByProject as listInvitationsByProjectRepo,
  updateInvitation as updateInvitationRepo,
  deleteInvitation as deleteInvitationRepo,
} from '../db/postgres/repo/invitation.repo';

import { createAuditLog } from '../db/postgres/repo/audit.repo';
import { db } from '../db/postgres';

/**
 * Service: create a new invitation and log the event.
 *
 * @param userId - The ID of the user creating the invitation.
 * @param data - The invitation creation payload.
 * @returns The newly created invitation.
 *
 * @example
 * ```ts
 * const invite = await createInvitation("user-uuid", {
 *   scope: "organization",
 *   organization_id: "org-uuid",
 *   inviter_user_id: "user-uuid",
 *   invitee_email: "test@example.com",
 *   token: "secureRandomToken",
 *   status: "pending"
 * });
 * ```
 */
export async function createInvitation(
  userId: string,
  data: CreateInvitation,
): Promise<Invitation> {
  return db.transaction().execute(async (trx) => {
    const invite = await createInvitationRepo(data, trx);

    await createAuditLog(
      {
        actor_id: userId,
        entity_type: 'invitation',
        entity_id: invite.id,
        event_type: 'invitation.created',
        diff: data as Record<string, unknown>,
        context: {},
      },
      trx,
    );

    return invite;
  });
}

/**
 * Service: get an invitation by its unique ID.
 *
 * @param id - Invitation ID.
 * @returns The invitation if found, otherwise null.
 *
 * @example
 * ```ts
 * const invite = await getInvitationById("inv-uuid");
 * ```
 */
export async function getInvitationById(id: string): Promise<Invitation | null> {
  return getInvitationByIdRepo(id);
}

/**
 * Service: get an invitation by its token.
 *
 * @param token - Secure invitation token.
 * @returns The invitation if found, otherwise null.
 *
 * @example
 * ```ts
 * const invite = await getInvitationByToken("secureRandomToken");
 * ```
 */
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  return getInvitationByTokenRepo(token);
}

/**
 * Service: list invitations for an organization.
 *
 * @param organizationId - The organization ID.
 * @param limit - Max number of invitations to return.
 * @param offset - Number of invitations to skip.
 * @returns An array of invitations.
 *
 * @example
 * ```ts
 * const invites = await listInvitationsByOrganization("org-uuid", 20, 0);
 * ```
 */
export async function listInvitationsByOrganization(
  organizationId: string,
  limit = 50,
  offset = 0,
): Promise<Invitation[]> {
  return listInvitationsByOrganizationRepo(organizationId, limit, offset);
}

/**
 * Service: list invitations for a project.
 *
 * @param projectId - The project ID.
 * @param limit - Max number of invitations to return.
 * @param offset - Number of invitations to skip.
 * @returns An array of invitations.
 *
 * @example
 * ```ts
 * const invites = await listInvitationsByProject("proj-uuid", 20, 0);
 * ```
 */
export async function listInvitationsByProject(
  projectId: string,
  limit = 50,
  offset = 0,
): Promise<Invitation[]> {
  return listInvitationsByProjectRepo(projectId, limit, offset);
}

/**
 * Service: redeem an invitation by setting status to "accepted".
 *
 * @param userId - The user accepting the invitation.
 * @param invitationId - The invitation ID being redeemed.
 * @returns The updated invitation if found, otherwise null.
 *
 * @example
 * ```ts
 * const redeemed = await redeemInvitation("user-uuid", "inv-uuid");
 * ```
 */
export async function redeemInvitation(
  userId: string,
  invitationId: string,
): Promise<Invitation | null> {
  return db.transaction().execute(async (trx) => {
    const updated = await updateInvitationRepo(
      invitationId,
      { status: 'accepted', invitee_user_id: userId },
      trx,
    );

    if (updated) {
      await createAuditLog(
        {
          actor_id: userId,
          entity_type: 'invitation',
          entity_id: invitationId,
          event_type: 'invitation.redeemed',
          diff: { status: 'accepted', invitee_user_id: userId },
          context: {},
        },
        trx,
      );
    }

    return updated;
  });
}

/**
 * Service: update an invitation and log the event.
 *
 * @param userId - The ID of the user updating the invitation.
 * @param id - Invitation ID.
 * @param data - Fields to update.
 * @returns The updated invitation if found, otherwise null.
 *
 * @example
 * ```ts
 * const updated = await updateInvitation("user-uuid", "inv-uuid", { status: "accepted" });
 * ```
 */
export async function updateInvitation(
  userId: string,
  id: string,
  data: UpdateInvitation,
): Promise<Invitation | null> {
  return db.transaction().execute(async (trx) => {
    const updated = await updateInvitationRepo(id, data, trx);

    if (updated) {
      await createAuditLog(
        {
          actor_id: userId,
          entity_type: 'invitation',
          entity_id: id,
          event_type: 'invitation.updated',
          diff: data as Record<string, unknown>,
          context: {},
        },
        trx,
      );
    }

    return updated;
  });
}

/**
 * Service: delete an invitation and log the event.
 *
 * @param userId - The ID of the user deleting the invitation.
 * @param id - Invitation ID.
 * @returns True if deleted, otherwise false.
 *
 * @example
 * ```ts
 * const deleted = await deleteInvitation("user-uuid", "inv-uuid");
 * if (deleted) console.log("Invitation deleted!");
 * ```
 */
export async function deleteInvitation(userId: string, id: string): Promise<boolean> {
  return db.transaction().execute(async (trx) => {
    const deleted = await deleteInvitationRepo(id, trx);

    if (deleted) {
      await createAuditLog(
        {
          actor_id: userId,
          entity_type: 'invitation',
          entity_id: id,
          event_type: 'invitation.deleted',
          diff: {},
          context: {},
        },
        trx,
      );
    }

    return deleted;
  });
}
