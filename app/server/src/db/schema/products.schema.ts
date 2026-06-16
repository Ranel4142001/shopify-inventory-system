import {
  mysqlTable, varchar, timestamp,
  int, mysqlEnum
} from 'drizzle-orm/mysql-core';
import { rules } from './rules.schema';

export const products = mysqlTable('products', {
  id: varchar('id', { length: 36 }).primaryKey(),
  ruleId: varchar('rule_id', { length: 36 })
    .notNull()
    .references(() => rules.id, { onDelete: 'cascade' }),
  stageName: varchar('stage_name', { length: 100 }).notNull(),
  orderIndex: int('order_index').notNull(),
  expectedDate: timestamp('expected_date').notNull(),
  actualDate: timestamp('actual_date'),
  status: mysqlEnum('status', [
    'pending',
    'in_progress',
    'completed',
    'delayed',
  ]).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;