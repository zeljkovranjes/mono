import { BillingCustomer } from './model';
import { StripeAdapter } from './stripe/adapter';

const adapter: BillingCustomer = new StripeAdapter();

export const billing: BillingCustomer = {
  createCustomer: adapter.createCustomer,
  getCustomer: adapter.getCustomer,
  getCustomerRaw: adapter.getCustomerRaw,
};
