// src/db/schemas/shops.schema.ts
import { mysqlTable, varchar, timestamp, boolean, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { binary16 } from './customTypes';

/**
 * shops
 * - Primary id: packed 16-byte UUID (publicId)
 * - domain is the unique lookup key (myshopify domain)
 */
export const shops = mysqlTable(
  'shops',
  {
    // Packed UUID primary id
    publicId: binary16('public_id').primaryKey(),

    // Shop domain used for lookups
    domain: varchar('domain', { length: 255 }).notNull(),

    // Encrypted Shopify OAuth token
    accessToken: varchar('access_token', { length: 512 }),

    // Space-separated OAuth scopes
    scope: varchar('scope', { length: 500 }),

    // Optional merchant email
    email: varchar('email', { length: 255 }),

    // Merchant shop name
    shopName: varchar('shop_name', { length: 255 }),

    // Whether the app is installed for this shop
    isActive: boolean('is_active').notNull().default(true),

    // When the app was first installed
    installedAt: timestamp('installed_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),

    // Last update time (auto-updated)
    updatedAt: timestamp('updated_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull().$onUpdate(() => new Date()),
  },
  (t) => ({
    // Unique domain lookup
    domainUniqueIdx: uniqueIndex('idx_shops_domain').on(t.domain),
    // Quickly find active shops
    isActiveIdx: index('idx_shops_is_active').on(t.isActive),
  }),
);

export type DbShop = typeof shops.$inferSelect;
export type DbNewShop = typeof shops.$inferInsert;

export type Shop = {
  id: string;
  domain: string;
  accessToken: string | null;
  scope: string | null;
  email: string | null;
  shopName: string | null;
  isActive: boolean;
  installedAt: Date;
  updatedAt: Date;
};
export type NewShop = Shop;
