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
