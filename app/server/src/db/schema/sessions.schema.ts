// src/db/schemas/sessions.schema.ts
import {
  mysqlTable,
  varchar,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { shops } from './shops.schema';
import { binary16 } from './customTypes';

/**
 * sessions
 * - Primary id: packed 16-byte UUID (publicId)
 * - FK: shopPublicId -> shops.public_id
 */
export const sessions = mysqlTable(
  'sessions',
  {
    // Packed UUID primary id
    publicId: binary16('public_id').primaryKey(),

    // FK to shops.public_id; deleting a shop removes its sessions
    shopPublicId: binary16('shop_public_id')
      .notNull()
      .references(() => shops.publicId, { onDelete: 'cascade' }),

    // Encrypted access token (kept inline for performance)
    accessToken: varchar('access_token', { length: 512 }).notNull(),

    // Encrypted refresh token
    refreshToken: varchar('refresh_token', { length: 512 }).notNull(),

    // Token expiry timestamp
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),

    // Creation time
    createdAt: timestamp('created_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    // Last update time (auto-updated)
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // One active session per shop
    shopUniqueIdx: uniqueIndex('idx_sessions_shop_public_id').on(table.shopPublicId),

    // Fast lookup for expired sessions
    expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
  }),
);

export type DbSession = typeof sessions.$inferSelect;
export type DbNewSession = typeof sessions.$inferInsert;

export type Session = {
  id: string;
  shopId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
export type NewSession = Session;
