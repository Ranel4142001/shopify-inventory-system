import {
  mysqlTable,
  varchar,
  timestamp,
  date,
  smallint,
  index,
  uniqueIndex,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { rules } from "./rules.schema";
import { binary16 } from "./customTypes";

/**
 * STAGE_STATUSES
 * - Reusable enum for product stage state
 */
export const STAGE_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "delayed",
] as const;

export type StageStatus = (typeof STAGE_STATUSES)[number];

/**
 * products
 * - Primary id: packed 16-byte UUID (publicId)
 * - FK: rulePublicId -> rules.public_id
 * - orderIndex uses smallint to save space
 */
export const products = mysqlTable(
  "products",
  {
    // Packed UUID primary id
    publicId: binary16("public_id").primaryKey(),

    // FK to rules.public_id; deleting a rule removes its products
    rulePublicId: binary16("rule_public_id")
      .notNull()
      .references(() => rules.publicId, { onDelete: "cascade" }),

    // Stage name (e.g., "Design", "Manufacturing")
    stageName: varchar("stage_name", { length: 100 }).notNull(),

    // Order within the rule (smallint is sufficient)
    orderIndex: smallint("order_index").notNull(),

    // Expected and actual ship dates (date-only)
    expectedDate: date("expected_date", { mode: "date" }).notNull(),
    actualDate: date("actual_date", { mode: "date" }),

    // Stage status enum
    status: mysqlEnum("status", STAGE_STATUSES).notNull().default("pending"),

    // Timestamps
    createdAt: timestamp("created_at", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    updatedAt: timestamp("updated_at", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Fast lookup by rule
    ruleIdIdx: index("idx_products_rule_public_id").on(table.rulePublicId),

    // Ensure unique order positions per rule
    ruleOrderUniqueIdx: uniqueIndex("ux_products_rule_order").on(
      table.rulePublicId,
      table.orderIndex,
    ),

    // Query by status across rules
    statusIdx: index("idx_products_status").on(table.status),
  }),
);

export type DbProduct = typeof products.$inferSelect;
export type DbNewProduct = typeof products.$inferInsert;

export type Product = {
  id: string;
  ruleId: string;
  stageName: string;
  orderIndex: number;
  expectedDate: Date;
  actualDate: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  createdAt: Date;
  updatedAt: Date;
};
export type NewProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};
