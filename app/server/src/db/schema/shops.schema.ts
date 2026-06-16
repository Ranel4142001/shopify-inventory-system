import { mysqlTable, varchar, timestamp, text } from 'drizzle-orm/mysql-core';

export const shops = mysqlTable('shops', {
  id: varchar('id', { length: 36 }).primaryKey(),
  domain: varchar('domain', { length: 255 }).notNull().unique(),
  accessToken: text('access_token').notNull(),
  scope: varchar('scope', { length: 500 }).notNull(),
  email: varchar('email', { length: 255 }),
  shopName: varchar('shop_name', { length: 255 }),
  isActive: varchar('is_active', { length: 5 }).notNull().default('true'),
  installedAt: timestamp('installed_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;