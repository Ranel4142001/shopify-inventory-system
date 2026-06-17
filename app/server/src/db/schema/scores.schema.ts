import {
  mysqlTable,
  varchar,
  timestamp,
  text,
  smallint,
  mediumint,
  tinyint,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { rules } from './rules.schema';

export const scores = mysqlTable(
  'scores',
  {
    id: varchar('id', { length: 36 }).primaryKey(),

    ruleId: varchar('rule_id', { length: 36 })
      .notNull()
      .references(() => rules.id, { onDelete: 'cascade' }),

    // Bounded 0–100 score — tinyint (0–127) is the right fit, saves 3 bytes vs int
    urgencyScore: tinyint('urgency_score').notNull().default(0),

    // Days until ship will rarely exceed ±32k — smallint saves 2 bytes vs int
    // Negative values are valid (overdue), so signed smallint is correct
    daysUntilShip: smallint('days_until_ship').notNull().default(0),

    // Delay in days — same reasoning as daysUntilShip
    delayDays: smallint('delay_days').notNull().default(0),

    // Customer count mirrors rules.schema — mediumint covers 0–16M
    customerCount: mediumint('customer_count').notNull().default(0),

    message: text('message'),

    // reportedAt and createdAt serve different purposes — keep both
    // reportedAt: when the score event occurred (business time)
    // createdAt: when the row was inserted (audit time)
    reportedAt: timestamp('reported_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    createdAt: timestamp('created_at', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    // Primary access pattern: all scores for a rule, newest first
    ruleIdIdx: index('idx_scores_rule_id').on(table.ruleId),

    // "Latest score per rule" is the most common read — composite covers it efficiently
    ruleReportedAtIdx: index('idx_scores_rule_reported_at').on(
      table.ruleId,
      table.reportedAt,
    ),

    // Enforce only one score snapshot per rule per timestamp
    // prevents duplicate score inserts for the same reporting window
    ruleReportedAtUniqueIdx: uniqueIndex('idx_scores_rule_reported_unique').on(
      table.ruleId,
      table.reportedAt,
    ),
  }),
);

export type Score = typeof scores.$inferSelect;
export type NewScore = typeof scores.$inferInsert;