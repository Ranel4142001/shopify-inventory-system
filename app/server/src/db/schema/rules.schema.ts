import {
  mysqlTable,
  varchar,
  timestamp,
  text,
  int,
  mediumint,
  smallint,
  tinyint,
  mysqlEnum,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { shops } from './shops.schema';

// ─── Enum values extracted as a const for reuse in app code ──────────────────
export const RULE_STATUSES = [
  'open',
  'closed',
  'in_production',
  'quality_check',
  'shipping',
  'fulfilled',
  'cancelled',
] as const;

export type RuleStatus = (typeof RULE_STATUSES)[number];

// ─── Table definition ─────────────────────────────────────────────────────────
export const rules = mysqlTable(
  'rules',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    shopId: varchar('shop_id', { length: 36 })
      .notNull()
      .references(() => shops.id, { onDelete: 'cascade' }),

    productTitle: varchar('product_title', { length: 255 }).notNull(),

    // Shopify handles are lowercase-kebab, 255 is the Shopify-enforced max
    productHandle: varchar('product_handle', { length: 255 }),

    // Shopify GIDs are numeric strings — 64 chars is plenty
    shopifyProductId: varchar('shopify_product_id', { length: 64 }),

    status: mysqlEnum('status', RULE_STATUSES).notNull().default('open'),

    // date-only — ship dates don't need time precision
    targetShipDate: date('target_ship_date', { mode: 'date' }).notNull(),

    currentStage: varchar('current_stage', { length: 100 })
      .notNull()
      .default('Funding'),

    // mediumint covers 0–16M customers; saves 1 byte vs int
    customerCount: mediumint('customer_count').notNull().default(0),

    // Funding amounts in minor currency units (cents) — int covers up to ~$21M
    fundingGoal: int('funding_goal').notNull().default(0),
    currentFunding: int('current_funding').notNull().default(0),

    // Urgency is a bounded score (e.g. 0–100) — tinyint (0–127) is sufficient
    urgencyScore: tinyint('urgency_score').notNull().default(0),

    notes: text('notes'),

    createdAt: timestamp('created_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    updatedAt: timestamp('updated_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Primary access pattern: all rules for a shop
    shopIdIdx: index('idx_rules_shop_id').on(table.shopId),

    // Enforce one rule per Shopify product per shop
    shopProductUniqueIdx: uniqueIndex('idx_rules_shop_product').on(
      table.shopId,
      table.shopifyProductId,
    ),

    // Dashboard filters by status (open, in_production, etc.)
    statusIdx: index('idx_rules_status').on(table.status),

    // Sorting/alerting by urgency score across a shop's rules
    urgencyIdx: index('idx_rules_shop_urgency').on(
      table.shopId,
      table.urgencyScore,
    ),
  }),
);

export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;