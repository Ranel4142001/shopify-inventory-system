import { mysqlTable, varchar, int, timestamp, index } from 'drizzle-orm/mysql-core';
import { rules } from './rules.schema';
import { shops } from './shops.schema';
import { sql } from 'drizzle-orm';

export const orders = mysqlTable(
  'orders',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    
    shopId: varchar('shop_id', { length: 36 })
      .notNull()
      .references(() => shops.id, { onDelete: 'cascade' }),
      
    ruleId: varchar('rule_id', { length: 36 })
      .notNull()
      .references(() => rules.id, { onDelete: 'cascade' }),
      
    quantity: int('quantity').notNull(),
    
    // Shopify Order ID reference
    orderReference: varchar('order_reference', { length: 255 }), 
    
    createdAt: timestamp('created_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    // Performance: Fast lookup for all orders in a specific group buy
    ruleIdx: index('idx_orders_rule_id').on(table.ruleId),
    shopIdx: index('idx_orders_shop_id').on(table.shopId),
  })
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;