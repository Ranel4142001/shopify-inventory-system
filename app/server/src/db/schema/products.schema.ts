import {
  mysqlTable,
  varchar,
  timestamp,
  smallint,
  mysqlEnum,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { rules } from './rules.schema';

// ─── Enum values extracted as a const for reuse in app code ──────────────────
export const STAGE_STATUSES = [
  'pending',
  'in_progress',
  'completed',
  'delayed',
] as const;

export type StageStatus = (typeof STAGE_STATUSES)[number];

// ─── Table definition ─────────────────────────────────────────────────────────
export const products = mysqlTable(
  'products',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    ruleId: varchar('rule_id', { length: 36 })
      .notNull()
      .references(() => rules.id, { onDelete: 'cascade' }),

    stageName: varchar('stage_name', { length: 100 }).notNull(),

    // smallint (0–32767) is sufficient for ordering and saves 2 bytes vs int
    orderIndex: smallint('order_index').notNull(),

    // date-only columns — no time component needed for expected/actual delivery dates
    expectedDate: date('expected_date', { mode: 'date' }).notNull(),
    actualDate: date('actual_date', { mode: 'date' }),

    status: mysqlEnum('status', STAGE_STATUSES).notNull().default('pending'),

    createdAt: timestamp('created_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    // ON UPDATE CURRENT_TIMESTAMP is the correct MySQL idiom for auto-updating timestamps
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Most queries will filter by ruleId — this is the primary access pattern
    ruleIdIdx: index('idx_products_rule_id').on(table.ruleId),

    // Enforce that stage order within a rule is unique (no two stages share position 1, 2, etc.)
    ruleOrderUniqueIdx: uniqueIndex('idx_products_rule_order').on(
      table.ruleId,
      table.orderIndex,
    ),

    // Querying "all delayed/in-progress stages across rules" is a common dashboard pattern
    statusIdx: index('idx_products_status').on(table.status),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;