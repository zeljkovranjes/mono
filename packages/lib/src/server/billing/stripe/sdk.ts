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
