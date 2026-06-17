import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const shops = mysqlTable(
  'shops',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    // The shop's myshopify.com domain — must be globally unique across all installs
    domain: varchar('domain', { length: 255 }).notNull(),

    // Shopify OAuth access token, stored encrypted at rest.
    // varchar(512) keeps the value inline in the InnoDB row (no extra disk read),
    // whereas TEXT always stores off-page with a pointer — slower on every fetch.
    accessToken: varchar('access_token', { length: 512 }).notNull(),

    // Space-separated OAuth scopes granted by the merchant (e.g. "read_orders write_products").
    // 500 chars is Shopify's practical maximum for a scope string.
    scope: varchar('scope', { length: 500 }).notNull(),

    // Optional — merchants may not expose their email via the API
    email: varchar('email', { length: 255 }),

    shopName: varchar('shop_name', { length: 255 }),

    // Whether this shop currently has the app installed.
    // Using a proper boolean instead of the original varchar('true'/'false')
    // saves space, prevents invalid values, and works naturally in conditionals.
    isActive: boolean('is_active').notNull().default(true),

    // When the app was first installed — never changes after initial insert
    installedAt: timestamp('installed_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    // Automatically refreshed on every row update (e.g. token rotation, scope change)
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Domain lookups happen on every incoming webhook and storefront request —
    // this unique index enforces one row per shop and makes those lookups instant
    domainUniqueIdx: uniqueIndex('idx_shops_domain').on(table.domain),

    // Quickly filter to only currently-installed shops (e.g. for billing or cron jobs)
    isActiveIdx: index('idx_shops_is_active').on(table.isActive),
  }),
);

export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;