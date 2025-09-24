export interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  metadata?: Record<string, string>;
}

/**
 * @internal
 *
 * Abstraction for managing customer records in a payment processor (e.g. Stripe).
 * @template T The underlying customer object type returned by the payment provider.
 */
export interface BillingCustomer {
  /**
   * Creates a new customer in the payment processor.
   *
   * @param customer - Customer details:
   *  - `name`: The customer's full name.
   *  - `email`: The customer's email address.
   *  - `metadata`: Optional key-value pairs to attach additional context
   *    (e.g. internal user ID, plan type).
   *
   * @returns A promise resolving to the created customer object from the payment processor.
   */
  createCustomer(customer: {
    name: string;
    email: string;
    metadata?: Record<string, string>;
  }): Promise<Customer>;

  /**
   * Retrieves a customer record.
   *
   * @param id - The unique customer ID assigned by the payment processor
   *             (e.g., `cus_123` in Stripe).
   * @returns A promise resolving to the normalized `Customer` object if found,
   *          or `null` if the customer does not exist or has been deleted.
   */
  getCustomer(id: string): Promise<Customer | null>;

  /**
   * @deprecated only use if NECESSARY.
   *
   * Retrieves the raw provider-specific customer object.
   *
   * @param id - The unique customer ID assigned by the payment processor.
   * @returns A promise resolving to the raw customer object (`TRaw`) if found,
   *          or `null` if the customer does not exist or has been deleted.
   */
  getCustomerRaw<T>(id: string): Promise<T | null>;
}
