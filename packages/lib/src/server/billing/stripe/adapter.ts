import Stripe from 'stripe';
import { CustomerAdapter } from '../model';
import { getStripe } from './sdk';

/**
 * Stripe implementation of the `CustomerAdapter` interface.
 *
 * @internal Consumers of the library should **not** call this adapter directly, as it
 * tightly couples your code to Stripe's SDK types. Use the exported `billing`
 * abstraction instead.
 *
 */
export const StripeAdapter: CustomerAdapter = {
  createCustomer: async function <T = Stripe.Customer>(details: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<T> {
    const stripe = getStripe();

    const created = await stripe.customers.create({
      email: details.email,
      name: details.name,
      metadata: details.metadata ?? {},
    });

    return created as T;
  },
  getCustomer: async function <T = Stripe.Customer | Stripe.DeletedCustomer>(
    id: string,
  ): Promise<T | null> {
    const stripe = getStripe();

    try {
      const res = await stripe.customers.retrieve(id);
      const payload = (res as any)?.data ?? (res as Stripe.Customer | Stripe.DeletedCustomer);

      return payload as T;
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.code === 'resource_missing') {
        return null;
      }
      throw err;
    }
  },
};
