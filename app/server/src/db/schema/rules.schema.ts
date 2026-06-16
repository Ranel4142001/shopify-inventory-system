import {
  mysqlTable, varchar, timestamp,
  text, int, mysqlEnum
} from 'drizzle-orm/mysql-core';
import { shops } from './shops.schema';

export const rules = mysqlTable('rules', {
  id: varchar('id', { length: 36 }).primaryKey(),
  shopId: varchar('shop_id', { length: 36 })
    .notNull()
    .references(() => shops.id, { onDelete: 'cascade' }),
  productTitle: varchar('product_title', { length: 255 }).notNull(),
  productHandle: varchar('product_handle', { length: 255 }),
  shopifyProductId: varchar('shopify_product_id', { length: 100 }),
  status: mysqlEnum('status', [
    'open',
    'closed',
    'in_production',
    'quality_check',
    'shipping',
    'fulfilled',
    'cancelled',
  ]).notNull().default('open'),
  targetShipDate: timestamp('target_ship_date').notNull(),
  currentStage: varchar('current_stage', { length: 100 }).notNull().default('Funding'),
  customerCount: int('customer_count').notNull().default(0),
  fundingGoal: int('funding_goal').notNull().default(0),
  currentFunding: int('current_funding').notNull().default(0),
  urgencyScore: int('urgency_score').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;