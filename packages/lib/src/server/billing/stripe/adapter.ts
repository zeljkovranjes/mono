import Stripe from 'stripe';
import { CustomerAdapter } from '../model';
import { getStripe } from './sdk';
import { createStripeCustomer, getStripeCustomer } from './customer';

/**
 * Stripe implementation of the `CustomerAdapter` interface.
 *
 * @internal Consumers of the library should **not** call this adapter directly, as it
 * tightly couples your code to Stripe's SDK types. Use the exported `billing`
 * abstraction instead.
 *
 */
export const StripeAdapter: CustomerAdapter = {
  async createCustomer<T = Stripe.Customer>(details: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<T> {
    const created = await createStripeCustomer({
      email: details.email,
      name: details.name,
      metadata: details.metadata ?? {},
    });

    return created as T;
  },

  async getCustomer<T = Stripe.Customer>(id: string): Promise<T | null> {
    const found = await getStripeCustomer(id);

    if (!found) {
      return null;
    }

    return found as T;
  },
};
