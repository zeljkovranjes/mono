export interface CustomerAdapter {
  /**
   * Creates a new customer in the billing provider.
   *
   * @param input
   *  - email: required customer email
   *  - name: optional customer name
   *  - metadata: arbitrary key/value pairs (e.g., { userId: "ory-123" })
   *
   * @returns A customer typed as `T` (defaults to `any`) or null.
   */
  createCustomer<T = any>(details: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<T>;

  /**
   * Retrieves a customer by provider-specific ID.
   *
   * @param id The billing provider’s customer identifier.
   * @returns A customer typed as `T` (defaults to `any`) or null.
   */
  getCustomer<T = any>(id: string): Promise<T | null>;
}
