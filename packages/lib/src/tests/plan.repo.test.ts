// src/tests/plan.repo.test.ts
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';

vi.mock('../server/db/postgres', async () => {
  return await vi.importActual('../server/db/postgres/index.mock');
});

import { db } from '../server/db/postgres';
import * as repo from '../server/db/postgres/repo/plan.repo';

describe('plan.repo (pg-mem integration tests)', () => {
  beforeAll(async () => {
    try {
      await db.schema.dropTable('plan').execute();
    } catch {}

    await db.schema
      .createTable('plan')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('name', 'varchar(255)', (c) => c.notNull())
      .addColumn('description', 'text')
      .addColumn('stripe_price_id', 'varchar(255)', (c) => c.notNull())
      .addColumn('stripe_product_id', 'varchar(255)', (c) => c.notNull())
      .addColumn('price_per_month', 'integer', (c) => c.notNull())
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('created_at', 'timestamptz', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamptz', (c) => c.defaultTo(new Date().toISOString()))
      .execute();
  });

  beforeEach(async () => {
    await db.deleteFrom('plan').execute();
  });

  it('creates a plan', async () => {
    const plan = await repo.createPlan({
      name: 'Pro',
      description: 'Pro features',
      stripe_price_id: 'price_123',
      stripe_product_id: 'prod_456',
      price_per_month: 29,
      metadata: {},
    });

    expect(plan.id).toBeDefined();
    expect(plan.name).toBe('Pro');

    const rows = await db.selectFrom('plan').selectAll().execute();
    expect(rows).toHaveLength(1);
  });

  it('fetches plan by id', async () => {
    const created = await repo.createPlan({
      name: 'Basic',
      stripe_price_id: 'price_basic',
      stripe_product_id: 'prod_basic',
      price_per_month: 10,
      metadata: {},
    });

    const found = await repo.getPlanById(created.id);
    expect(found?.name).toBe('Basic');
  });

  it('returns null when id not found', async () => {
    const found = await repo.getPlanById(randomUUID());
    expect(found).toBeNull();
  });

  it('fetches plan by stripe_price_id', async () => {
    const created = await repo.createPlan({
      name: 'Test Plan',
      stripe_price_id: 'price_test',
      stripe_product_id: 'prod_test',
      price_per_month: 5,
      metadata: {},
    });

    const found = await repo.getPlanByPriceId('price_test');
    expect(found?.id).toBe(created.id);
  });

  it('fetches plan by stripe_product_id', async () => {
    const created = await repo.createPlan({
      name: 'Enterprise',
      stripe_price_id: 'price_enterprise',
      stripe_product_id: 'prod_enterprise',
      price_per_month: 99,
      metadata: {},
    });

    const found = await repo.getPlanByProductId('prod_enterprise');
    expect(found?.id).toBe(created.id);
  });

  it('lists plans with pagination', async () => {
    await repo.createPlan({
      name: 'One',
      stripe_price_id: 'price_one',
      stripe_product_id: 'prod_one',
      price_per_month: 1,
      metadata: {},
    });
    await repo.createPlan({
      name: 'Two',
      stripe_price_id: 'price_two',
      stripe_product_id: 'prod_two',
      price_per_month: 2,
      metadata: {},
    });

    const list = await repo.listPlans(10, 0);
    expect(list.length).toBe(2);
  });

  it('updates a plan', async () => {
    const created = await repo.createPlan({
      name: 'Old',
      stripe_price_id: 'price_old',
      stripe_product_id: 'prod_old',
      price_per_month: 10,
      metadata: {},
    });

    const updated = await repo.updatePlan(created.id, { name: 'New', price_per_month: 20 });

    expect(updated?.name).toBe('New');
    expect(updated?.price_per_month).toBe(20);
  });

  it('returns null if update not found', async () => {
    const updated = await repo.updatePlan(randomUUID(), { name: 'NotFound' });
    expect(updated).toBeNull();
  });

  it('deletes a plan', async () => {
    const created = await repo.createPlan({
      name: 'DeleteMe',
      stripe_price_id: 'price_del',
      stripe_product_id: 'prod_del',
      price_per_month: 5,
      metadata: {},
    });

    const deleted = await repo.deletePlan(created.id);
    expect(deleted).toBe(true);

    const after = await repo.getPlanById(created.id);
    expect(after).toBeNull();
  });

  it('returns false when delete fails', async () => {
    const deleted = await repo.deletePlan(randomUUID());
    expect(deleted).toBe(false);
  });
});
