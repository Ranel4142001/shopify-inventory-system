import {
  mysqlTable, varchar, timestamp,
  text, mysqlEnum
} from 'drizzle-orm/mysql-core';
import { shops } from './shops.schema';

export const activityLogs = mysqlTable('activity_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  shopId: varchar('shop_id', { length: 36 })
    .notNull()
    .references(() => shops.id, { onDelete: 'cascade' }),
  groupBuyId: varchar('group_buy_id', { length: 36 }), // nullable — some logs are shop-wide
  actionType: mysqlEnum('action_type', [
    'group_buy_created',
    'group_buy_updated',
    'group_buy_cancelled',
    'stage_updated',
    'supplier_update_added',
    'alert_fired',
    'score_recalculated',
    'shop_installed',
    'shop_uninstalled',
  ]).notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'), // JSON string for extra context
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;