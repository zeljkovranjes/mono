import Stripe from 'stripe';
import { getServerConfig } from '../../env/runtime';

let stripe: Stripe | null = null;
let version: Stripe.LatestApiVersion = '2025-08-27.basil';

/**
 * Initializes and returns a new Stripe instance using the server's secret key.
 *
 * @returns A Stripe instance configured with the server's secret key.
 *
 * Example:
 * ```ts
 * const stripe = getStripe();
 * ```
 */
export function getStripe(): Stripe {
  if (stripe) {
    return stripe;
  }

  stripe = new Stripe(getServerConfig().STRIPE_SECRET_KEY, {
    apiVersion: version,
  });

  return stripe;
}

/**
 * Creates a new Stripe customer with the given parameters.
 *
 * @internal This function is intended only for internal use within
 * `@safeoutput/lib`. Consumers of the library should not call
 * it directly.
 *
 * @param params Standard Stripe.CustomerCreateParams.
 * @returns The created Stripe customer object.
 *
 * Example:
 * ```ts
 * const customer = await createStripeCustomer({
 *   email: 'user@example.com',
 *   name: 'Jane Doe',
 *   metadata: { userId: 'ory-123' },
 * });
 * ```
 */
export async function createStripeCustomer(
  params: Stripe.CustomerCreateParams,
): Promise<Stripe.Customer> {
  return getStripe().customers.create(params);
}

/**
 * Retrieves an existing Stripe customer by ID.
 *
 * @internal This function is intended only for internal use within
 * `@safeoutput/lib`. Consumers of the library should not call
 * it directly.
 *
 * @param id The Stripe customer ID (e.g., `cus_123`).
 * @returns The Stripe customer object if found, or `null` if the customer is deleted.
 *
 * Example:
 * ```ts
 * const customer = await getStripeCustomer('cus_123');
 * if (!customer) {
 *   console.log('Customer not found or deleted');
 * }
 * ```
 */
export async function getStripeCustomer(id: string): Promise<Stripe.Customer | null> {
  const res = await getStripe().customers.retrieve(id);
  if ('deleted' in res && res.deleted) {
    return null;
  }

  return res as Stripe.Customer;
}
