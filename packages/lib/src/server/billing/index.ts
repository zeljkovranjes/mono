import Stripe from 'stripe';
import { BillingCustomer } from './model';
import { StripeAdapter } from './stripe/adapter';

let adapter: BillingCustomer = new StripeAdapter();

export const billing: BillingCustomer = {
  createCustomer: adapter.createCustomer,
  getCustomer: adapter.getCustomer,
  getCustomerRaw: adapter.getCustomerRaw,
};
