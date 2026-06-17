import {
  mysqlTable,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { shops } from './shops.schema';

export const sessions = mysqlTable(
  'sessions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    // Each session belongs to one shop; deleting the shop wipes its sessions
    shopId: varchar('shop_id', { length: 36 })
      .notNull()
      .references(() => shops.id, { onDelete: 'cascade' }),

    // Stored encrypted at rest — varchar(512) comfortably holds
    // any encrypted OAuth token without the overhead of TEXT (which
    // always goes off-page in InnoDB and requires an extra disk read)
    accessToken: varchar('access_token', { length: 512 }).notNull(),

    // Same reasoning as accessToken
    refreshToken: varchar('refresh_token', { length: 512 }).notNull(),

    // When the access token expires and a refresh is needed
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),

    // When this session row was first created
    createdAt: timestamp('created_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    // Automatically updated whenever the row is changed (e.g. token refresh)
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // One active session per shop — enforces this at the DB level.
    // If a shop re-installs or re-authenticates, upsert into this unique slot
    // rather than accumulating stale session rows.
    shopUniqueIdx: uniqueIndex('idx_sessions_shop_id').on(table.shopId),

    // Fast lookup when validating a token on every incoming request
    expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
  }),
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;