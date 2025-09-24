import { BillingCustomer, Customer } from '../model';
import { createStripeCustomer, getStripeCustomer } from './customer';

/**
 * @internal
 *
 * Stripe implementation of BillingCustomer.
 */
export class StripeAdapter implements BillingCustomer {
  async createCustomer(customer: {
    name: string;
    email: string;
    metadata?: Record<string, string>;
  }): Promise<Customer> {
    const stripeCustomer = await createStripeCustomer({
      name: customer.name,
      email: customer.email,
      metadata: customer.metadata,
    });

    return {
      id: stripeCustomer.id,
      name: stripeCustomer.name!,
      email: stripeCustomer.email,
      metadata: stripeCustomer.metadata ?? undefined,
    };
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const stripeCustomer = await getStripeCustomer(id);
    if (!stripeCustomer) return null;

    return {
      id: stripeCustomer.id,
      name: stripeCustomer.name!,
      email: stripeCustomer.email,
      metadata: stripeCustomer.metadata ?? undefined,
    };
  }

  async getCustomerRaw<T>(id: string): Promise<T | null> {
    return getStripeCustomer(id) as T | null;
  }
}
