import {
  mysqlTable, varchar, timestamp,
  text, int
} from 'drizzle-orm/mysql-core';
import { rules } from './rules.schema';

export const scores = mysqlTable('scores', {
  id: varchar('id', { length: 36 }).primaryKey(),
  ruleId: varchar('rule_id', { length: 36 })
    .notNull()
    .references(() => rules.id, { onDelete: 'cascade' }),
  urgencyScore: int('urgency_score').notNull().default(0),
  daysUntilShip: int('days_until_ship').notNull().default(0),
  delayDays: int('delay_days').notNull().default(0),
  customerCount: int('customer_count').notNull().default(0),
  message: text('message'),
  reportedAt: timestamp('reported_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Score = typeof scores.$inferSelect;
export type NewScore = typeof scores.$inferInsert;