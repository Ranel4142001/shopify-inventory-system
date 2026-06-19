import { mysqlTable, varchar, int, timestamp, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { rules } from './rules.schema';
import { shops } from './shops.schema';
import { binary16 } from './customTypes';

/**
 * orders
 * - Primary id: packed 16-byte UUID (publicId)
 * - FKs: shopPublicId -> shops.public_id, rulePublicId -> rules.public_id
 */
export const orders = mysqlTable(
  'orders',
  {
    // Packed UUID primary id for the order
    publicId: binary16('public_id').primaryKey(),

    // FK to shops.public_id; deleting a shop removes its orders
    shopPublicId: binary16('shop_public_id')
      .notNull()
      .references(() => shops.publicId, { onDelete: 'cascade' }),

    // FK to rules.public_id; deleting a rule removes its orders
    rulePublicId: binary16('rule_public_id')
      .notNull()
      .references(() => rules.publicId, { onDelete: 'cascade' }),

    // Quantity ordered
    quantity: int('quantity').notNull(),

    // Reference to Shopify order (string)
    orderReference: varchar('order_reference', { length: 255 }),

    // When the order was created
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    // Fast lookup for orders by rule (group buy)
    ruleIdx: index('idx_orders_rule_public_id').on(t.rulePublicId),

    // Fast lookup for orders by shop
    shopIdx: index('idx_orders_shop_public_id').on(t.shopPublicId),
  }),
);

export type DbOrder = typeof orders.$inferSelect;
export type DbNewOrder = typeof orders.$inferInsert;

export type Order = {
  id: string;
  shopId: string;
  ruleId: string;
  quantity: number;
  orderReference: string | null;
  createdAt: Date;
};
export type NewOrder = Omit<Order, 'createdAt'> & {
  createdAt?: Date;
};
