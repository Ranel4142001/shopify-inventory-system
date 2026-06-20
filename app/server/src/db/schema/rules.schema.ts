import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  text,
  date,
  tinyint,
  mediumint,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { shops } from "./shops.schema";
import { binary16 } from "./customTypes";

/**
 * RULE_STATUSES
 * - Reusable enum for rule lifecycle
 */
export const RULE_STATUSES = [
  "open",
  "closed",
  "in_production",
  "quality_check",
  "shipping",
  "fulfilled",
  "cancelled",
] as const;

export type RuleStatus = (typeof RULE_STATUSES)[number];

/**
 * rules (group buys)
 * - Primary id: packed 16-byte UUID (publicId)
 * - FK: shopPublicId -> shops.public_id
 */
export const rules = mysqlTable(
  "rules",
  {
    // Packed UUID primary id
    publicId: binary16("public_id").primaryKey(),

    // FK to shops.public_id; deleting a shop removes its rules
    shopPublicId: binary16("shop_public_id")
      .notNull()
      .references(() => shops.publicId, { onDelete: "cascade" }),

    // Product title and storefront handle
    productTitle: varchar("product_title", { length: 255 }).notNull(),
    productHandle: varchar("product_handle", { length: 255 }),

    // Shopify product id (string)
    shopifyProductId: varchar("shopify_product_id", { length: 64 }),

    // Rule status (enum)
    status: mysqlEnum("status", RULE_STATUSES).notNull().default("open"),

    // Planned ship date (date only)
    targetShipDate: date("target_ship_date").notNull(),

    // Current stage name
    currentStage: varchar("current_stage", { length: 100 })
      .notNull()
      .default("Funding"),

    // Counts and money (compact numeric types)
    customerCount: mediumint("customer_count").notNull().default(0),
    fundingGoal: int("funding_goal").notNull().default(0),
    currentFunding: int("current_funding").notNull().default(0),

    // Bounded urgency score (0–127)
    urgencyScore: tinyint("urgency_score").notNull().default(0),

    // Freeform notes
    notes: text("notes"),

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
    // All rules for a shop
    shopIdIdx: index("idx_rules_shop_public_id").on(table.shopPublicId),

    // One rule per Shopify product per shop
    shopProductUniqueIdx: uniqueIndex("ux_rules_shop_product").on(
      table.shopPublicId,
      table.shopifyProductId,
    ),

    // Filter by status
    statusIdx: index("idx_rules_status").on(table.status),

    // Sort or alert by urgency within a shop
    urgencyIdx: index("idx_rules_shop_urgency").on(
      table.shopPublicId,
      table.urgencyScore,
    ),
  }),
);

export type DbRule = typeof rules.$inferSelect;
export type DbNewRule = typeof rules.$inferInsert;

export type Rule = {
  id: string;
  shopId: string;
  productTitle: string;
  productHandle: string | null;
  shopifyProductId: string | null;
  status: RuleStatus;
  targetShipDate: Date;
  currentStage: string;
  customerCount: number;
  fundingGoal: number;
  currentFunding: number;
  urgencyScore: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewRule = Omit<Rule, "createdAt" | "updatedAt" | "status" | "currentStage" | "customerCount" | "fundingGoal" | "currentFunding" | "urgencyScore"> & {
  status?: RuleStatus;
  currentStage?: string;
  customerCount?: number;
  fundingGoal?: number;
  currentFunding?: number;
  urgencyScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
};
