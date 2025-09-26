import { CreateOrganization, OrganizationSchema } from '@safeoutput/contracts/organization/schema';
import { db } from '..';
import { nanoid } from 'nanoid';
import { randomUUID } from 'crypto';
import { sql } from 'kysely';
import { JsonObject } from '../../types/pg-database-types';

/**
 * Creates a new organization record in the database.
 *
 * @param org - The input payload containing organization details.
 *              Must include `name`, `slug?`, `type`, `metadata?`, and `current_plan_id?`.
 *
 * @returns A parsed and validated organization object.
 *
 * @throws If the insert fails or validation against `OrganizationSchema` fails.
 *
 * @example
 * const org = await createOrganization({
 *   name: "Acme Inc",
 *   type: "business",
 *   metadata: { region: "US" }
 * });
 * console.log(org.id); // → UUID of the new organization
 */
export async function createOrganization(org: CreateOrganization) {
  const newOrganization = await db
    .insertInto('organization')
    .values({
      id: randomUUID(),
      name: org.name,
      slug: org.slug ?? nanoid(),
      type: org.type,
      metadata: (org.metadata ?? {}) as unknown as JsonObject,
      current_plan_id: org.current_plan_id ?? null,
    })
    .executeTakeFirstOrThrow();

  return OrganizationSchema.parse(newOrganization);
}
