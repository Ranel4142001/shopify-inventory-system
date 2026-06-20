import {
  mysqlTable,
  tinyint,
  smallint,
  mediumint,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { rules } from "./rules.schema";
import { binary16 } from "./customTypes";

/**
 * scores
 * - Primary id: packed 16-byte UUID (publicId)
 * - FK: rulePublicId -> rules.public_id
 * - Compact numeric types chosen to save space
 */
export const scores = mysqlTable(
  "scores",
  {
    // Packed UUID primary id
    publicId: binary16("public_id").primaryKey(),

    // FK to rules.public_id; deleting a rule removes its scores
    rulePublicId: binary16("rule_public_id")
      .notNull()
      .references(() => rules.publicId, { onDelete: "cascade" }),

    // 0–100 urgency score (tinyint saves space)
    urgencyScore: tinyint("urgency_score").notNull().default(0),

    // Days until ship (signed smallint for negative/positive values)
    daysUntilShip: smallint("days_until_ship").notNull().default(0),

    // Delay in days (signed smallint)
    delayDays: smallint("delay_days").notNull().default(0),

    // Customer count (mediumint to cover up to ~16M)
    customerCount: mediumint("customer_count").notNull().default(0),

    // Optional message or explanation
    message: text("message"),

    // Business time when the score was reported
    reportedAt: timestamp("reported_at", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    // Row insertion time (audit)
    createdAt: timestamp("created_at", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    // Fast lookup of scores for a rule
    ruleIdIdx: index("idx_scores_rule_public_id").on(table.rulePublicId),

    // Common pattern: latest scores per rule
    ruleReportedAtIdx: index("idx_scores_rule_reported_at").on(
      table.rulePublicId,
      table.reportedAt,
    ),

    // Prevent duplicate reports for same rule + timestamp
    ruleReportedAtUniqueIdx: uniqueIndex("ux_scores_rule_reported").on(
      table.rulePublicId,
      table.reportedAt,
    ),
  }),
);

export type DbScore = typeof scores.$inferSelect;
export type DbNewScore = typeof scores.$inferInsert;

export type Score = {
  id: string;
  ruleId: string;
  urgencyScore: number;
  daysUntilShip: number;
  delayDays: number;
  customerCount: number;
  message: string | null;
  reportedAt: Date;
  createdAt: Date;
};
export type NewScore = Omit<Score, 'createdAt'> & {
  createdAt?: Date;
};
