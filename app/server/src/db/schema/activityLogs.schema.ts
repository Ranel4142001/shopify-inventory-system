import {
  mysqlTable,
  text,
  mysqlEnum,
  timestamp,
  index,
  json,
} from 'drizzle-orm/mysql-core';
import { shops } from './shops.schema';
import { rules } from './rules.schema';
import { binary16 } from './customTypes';

/**
 * ACTION_TYPES
 * - Reusable enum for activity event types
 */
export const ACTION_TYPES = [
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

/**
 * activity_logs
 * - Primary id: packed 16-byte UUID (publicId)
 * - FKs: shopPublicId -> shops.public_id, groupBuyPublicId -> rules.public_id
 */
export const activityLogs = mysqlTable(
  'activity_logs',
  {
    // Packed UUID primary id for the log entry
    publicId: binary16('public_id').primaryKey(),

    // FK to shops.public_id; deleting a shop removes its logs
    shopPublicId: binary16('shop_public_id')
      .notNull()
      .references(() => shops.publicId, { onDelete: 'cascade' }),

    // Optional FK to a group buy (rule); nullable
    groupBuyPublicId: binary16('group_buy_public_id')
      .references(() => rules.publicId, { onDelete: 'set null' }),

    // Event type
    actionType: mysqlEnum('action_type', ACTION_TYPES).notNull(),

    // Human readable description
    description: text('description').notNull(),

    // Structured metadata (JSON)
    metadata: json('metadata').$type<Record<string, unknown>>(),

    // When the log was created
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    // Indexes for common queries
    shopIdIdx: index('idx_activity_logs_shop_public_id').on(t.shopPublicId),
    groupBuyIdIdx: index('idx_activity_logs_group_buy_public_id').on(t.groupBuyPublicId),
    createdAtIdx: index('idx_activity_logs_created_at').on(t.createdAt),

    // Fetch logs for a shop ordered by time
    shopCreatedAtIdx: index('idx_activity_logs_shop_created_at').on(t.shopPublicId, t.createdAt),
  }),
);

export type DbActivityLog = typeof activityLogs.$inferSelect;
export type DbNewActivityLog = typeof activityLogs.$inferInsert;

export type ActivityLog = {
  id: string;
  shopId: string;
  groupBuyId: string | null;
  actionType: 'group_buy_created' | 'group_buy_updated' | 'group_buy_cancelled' | 'stage_updated' | 'supplier_update_added' | 'alert_fired' | 'score_recalculated' | 'shop_installed' | 'shop_uninstalled';
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};
export type NewActivityLog = Omit<ActivityLog, 'createdAt'> & {
  createdAt?: Date;
};
