import Stripe from 'stripe';
import { CustomerAdapter } from './model';
import { StripeAdapter } from './stripe/adapter';

let adapter: CustomerAdapter = StripeAdapter;

export const billing: CustomerAdapter = {
  createCustomer: adapter.createCustomer,
  getCustomer: adapter.getCustomer,
};
