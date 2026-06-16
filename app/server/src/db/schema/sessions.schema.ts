import { mysqlTable, varchar, timestamp, text } from 'drizzle-orm/mysql-core';
import { shops } from './shops.schema';

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  shopId: varchar('shop_id', { length: 36 })
    .notNull()
    .references(() => shops.id, { onDelete: 'cascade' }),
  accessToken: text('access_token').notNull(),   // encrypted
  refreshToken: text('refresh_token').notNull(), // encrypted
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;