import {
  mysqlTable,
  varchar,
  timestamp,
  text,
  mysqlEnum,
  index,
  json,
} from 'drizzle-orm/mysql-core';
import { shops } from './shops.schema';

//Defined once — reused in schema + TypeScript types
const ACTION_TYPES = [
  'group_buy_created',
  'group_buy_updated',
  'group_buy_cancelled',
  'stage_updated',
  'supplier_update_added',
  'alert_fired',
  'score_recalculated',
  'shop_installed',
  'shop_uninstalled',
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export const activityLogs = mysqlTable(
  'activity_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    shopId: varchar('shop_id', { length: 36 })
      .notNull()
      .references(() => shops.id, { onDelete: 'cascade' }),

    groupBuyId: varchar('group_buy_id', { length: 36 }), // nullable — some logs are shop-wide

    actionType: mysqlEnum('action_type', ACTION_TYPES).notNull(),

    description: text('description').notNull(),

    //  json() instead of text() — structured, type-safe, no manual JSON.parse/stringify
    metadata: json('metadata').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    //  Indexes for the most common query patterns
    shopIdIdx: index('idx_activity_logs_shop_id').on(table.shopId),
    groupBuyIdIdx: index('idx_activity_logs_group_buy_id').on(table.groupBuyId),
    createdAtIdx: index('idx_activity_logs_created_at').on(table.createdAt),
    //  Composite index for "logs for a shop, sorted by time" — very common pattern
    shopCreatedAtIdx: index('idx_activity_logs_shop_created_at').on(
      table.shopId,
      table.createdAt
    ),
  })
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;