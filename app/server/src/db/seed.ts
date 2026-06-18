import { db } from "./client";
import {
  shops,
  sessions,
  rules,
  products,
  scores,
  activityLogs,
} from "./schema";
import { v4 as uuidv4 } from "uuid";
import {
  encrypt,
  generateAccessToken,
  generateRefreshToken,
} from "../shared/utils/crypto";

async function seed() {
  console.log(" Seeding database...");

  // ── 1. Create Shop ───────────────────────────────────────────
  const shopId = uuidv4();
  const shopDomain = "tactile-lab.myshopify.com";

  await db
    .insert(shops)
    .values({
      id: shopId,
      domain: shopDomain,
      accessToken: encrypt("shpat_dummy_access_token_for_seeding"),
      scope: "read_products,write_products,read_orders,read_customers",
      email: "admin@tactilelab.com",
      shopName: "Tactile Lab",
      isActive: true, // ✅ was: 'true' (string) — now correct boolean
      installedAt: new Date(),
      updatedAt: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: {
        shopName: "Tactile Lab",
        updatedAt: new Date(),
      },
    });

  // Get the actual shop row (may have already existed before the upsert)
  const existingShop = await db.select().from(shops).limit(1);
  const actualShopId = existingShop[0].id;

  console.log("✅ Shop created");

  // ── 2. Create Session ────────────────────────────────────────
  const sessionId = uuidv4();

  const accessToken = generateAccessToken({
    shopId: actualShopId,
    shop: shopDomain,
    sessionId,
  });

  const refreshToken = generateRefreshToken({
    shopId: actualShopId,
    shop: shopDomain,
    sessionId,
  });

  await db
    .insert(sessions)
    .values({
      id: sessionId,
      shopId: actualShopId,
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("✅ Session created");

  // ── 3. Create Group Buys (Rules) ─────────────────────────────
  const groupBuys = [
    {
      id: uuidv4(),
      productTitle: "TL-Obsidian 65% Keyboard",
      status: "in_production" as const,
      targetShipDate: new Date("2026-07-15"),
      currentStage: "Assembly",
      customerCount: 847,
      fundingGoal: 150000,
      currentFunding: 148500,
      urgencyScore: 88,
      notes: "Manufacturing at Huizhou factory. Assembly phase started June 1.",
      daysUntilShip: 28,
      delayDays: 14,
    },
    {
      id: uuidv4(),
      productTitle: "TL-Cosmos 75% Aluminum",
      status: "in_production" as const,
      targetShipDate: new Date("2026-08-01"),
      currentStage: "Injection Molding",
      customerCount: 512,
      fundingGoal: 120000,
      currentFunding: 119800,
      urgencyScore: 72,
      notes: "Polycarbonate plate variant delayed due to material shortage.",
      daysUntilShip: 45,
      delayDays: 7,
    },
    {
      id: uuidv4(),
      productTitle: "TL-Carbon TKL",
      status: "quality_check" as const,
      targetShipDate: new Date("2026-06-30"),
      currentStage: "QC",
      customerCount: 324,
      fundingGoal: 80000,
      currentFunding: 80000,
      urgencyScore: 95,
      notes: "QC found minor PCB issues on 3% of units. Rework in progress.",
      daysUntilShip: 13,
      delayDays: 21,
    },
    {
      id: uuidv4(),
      productTitle: "TL-Phantom 60% Wireless",
      status: "open" as const,
      targetShipDate: new Date("2026-12-01"),
      currentStage: "Funding",
      customerCount: 156,
      fundingGoal: 200000,
      currentFunding: 78000,
      urgencyScore: 15,
      notes: "Group buy open until July 31. Wireless + hot-swap PCB.",
      daysUntilShip: 167,
      delayDays: 0,
    },
    {
      id: uuidv4(),
      productTitle: "TL-Eclipse Pro 65%",
      status: "shipping" as const,
      targetShipDate: new Date("2026-06-20"),
      currentStage: "Shipping",
      customerCount: 623,
      fundingGoal: 100000,
      currentFunding: 100000,
      urgencyScore: 62,
      notes:
        "Units shipped from China June 10. In transit to fulfillment centers.",
      daysUntilShip: 3,
      delayDays: 0,
    },
    {
      id: uuidv4(),
      productTitle: "TL-Glacier Ice Keycap Set",
      status: "in_production" as const,
      targetShipDate: new Date("2026-09-15"),
      currentStage: "Tooling",
      customerCount: 1205,
      fundingGoal: 60000,
      currentFunding: 60000,
      urgencyScore: 35,
      notes: "Tooling for legends in progress. Colorway approved by designer.",
      daysUntilShip: 90,
      delayDays: 0,
    },
    {
      id: uuidv4(),
      productTitle: "TL-Ember Switch Set (Linear)",
      status: "fulfilled" as const,
      targetShipDate: new Date("2026-05-01"),
      currentStage: "Shipping",
      customerCount: 445,
      fundingGoal: 30000,
      currentFunding: 30000,
      urgencyScore: 0,
      notes: "All units delivered. Positive community feedback.",
      daysUntilShip: -47,
      delayDays: 0,
    },
  ];

  const ruleIds: string[] = [];

  // Manufacturing stages in order — used to derive each stage's status
  const ALL_STAGES = [
    "Funding",
    "Design Review",
    "Tooling",
    "Injection Molding",
    "Assembly",
    "QC",
    "Shipping",
  ] as const;

  for (const gb of groupBuys) {
    const ruleId = gb.id;
    ruleIds.push(ruleId);

    // ── 3a. Insert rule ──────────────────────────────────────
    await db.insert(rules).values({
      id: ruleId,
      shopId: actualShopId,
      productTitle: gb.productTitle,
      // Derive a URL-safe handle from the product title
      productHandle: gb.productTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      shopifyProductId: null,
      status: gb.status,
      targetShipDate: gb.targetShipDate,
      currentStage: gb.currentStage,
      customerCount: gb.customerCount,
      fundingGoal: gb.fundingGoal,
      currentFunding: gb.currentFunding,
      urgencyScore: gb.urgencyScore,
      notes: gb.notes,
      // Spread createdAt randomly across the last 90 days to simulate real data
      createdAt: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
      ),
      updatedAt: new Date(),
    });

    // ── 3b. Insert manufacturing stages (products) ───────────
    const currentStageIndex = ALL_STAGES.indexOf(
      gb.currentStage as (typeof ALL_STAGES)[number],
    );

    for (let i = 0; i < ALL_STAGES.length; i++) {
      const stageName = ALL_STAGES[i];
      const isCompleted = i < currentStageIndex;
      const isCurrent = i === currentStageIndex;

      // Space expected dates evenly backwards from the target ship date (14-day intervals)
      const expectedDate = new Date(
        gb.targetShipDate.getTime() -
          (ALL_STAGES.length - 1 - i) * 14 * 24 * 60 * 60 * 1000,
      );

      // Completed stages got finished slightly ahead of schedule (random 0–5 days early)
      const actualDate = isCompleted
        ? new Date(
            expectedDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000,
          )
        : null;

      // Current stage is 'delayed' if the group buy has accumulated delay days
      const stageStatus = isCompleted
        ? "completed"
        : isCurrent
          ? gb.delayDays > 0
            ? "delayed"
            : "in_progress"
          : "pending";

      await db.insert(products).values({
        id: uuidv4(),
        ruleId,
        stageName,
        orderIndex: i + 1,
        expectedDate,
        actualDate,
        status: stageStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // ── 3c. Insert urgency score snapshot ────────────────────
    const scoreMessage =
      gb.urgencyScore >= 75
        ? "Immediate action required — contact supplier and notify customers"
        : gb.urgencyScore >= 50
          ? "Review this group buy today and update manufacturing stage"
          : gb.urgencyScore >= 25
            ? "Monitor closely — check for supplier updates this week"
            : "On track — continue routine monitoring";

    await db.insert(scores).values({
      id: uuidv4(),
      ruleId,
      urgencyScore: gb.urgencyScore,
      daysUntilShip: gb.daysUntilShip,
      delayDays: gb.delayDays,
      customerCount: gb.customerCount,
      message: scoreMessage,
      reportedAt: new Date(),
      createdAt: new Date(),
    });
  }

  console.log("✅ Group buys, stages, and scores created");

  // ── 4. Create Activity Logs ──────────────────────────────────
  const activities = [
    {
      actionType: "alert_fired" as const,
      description:
        "🚨 TL-Carbon TKL is CRITICAL — QC issues detected, ship date at risk",
      groupBuyIndex: 2,
      minutesAgo: 5,
    },
    {
      actionType: "stage_updated" as const,
      description: "TL-Carbon TKL moved to QC stage — PCB rework in progress",
      groupBuyIndex: 2,
      minutesAgo: 120,
    },
    {
      actionType: "supplier_update_added" as const,
      description:
        "Supplier update: TL-Obsidian 65% assembly 60% complete, on schedule",
      groupBuyIndex: 0,
      minutesAgo: 240,
    },
    {
      actionType: "score_recalculated" as const,
      description: "Urgency scores recalculated for all active group buys",
      groupBuyIndex: -1, // -1 = shop-wide log, no specific group buy
      minutesAgo: 360,
    },
    {
      actionType: "group_buy_updated" as const,
      description:
        "TL-Cosmos 75% delay updated — polycarbonate plate delayed 7 days",
      groupBuyIndex: 1,
      minutesAgo: 480,
    },
    {
      actionType: "alert_fired" as const,
      description:
        "⚠️ TL-Eclipse Pro 65% ships in 3 days — notify customers now",
      groupBuyIndex: 4,
      minutesAgo: 720,
    },
    {
      actionType: "stage_updated" as const,
      description: "TL-Eclipse Pro 65% moved to Shipping stage",
      groupBuyIndex: 4,
      minutesAgo: 1440,
    },
    {
      actionType: "group_buy_created" as const,
      description: "New group buy created: TL-Phantom 60% Wireless",
      groupBuyIndex: 3,
      minutesAgo: 2880,
    },
    {
      actionType: "supplier_update_added" as const,
      description: "Supplier update: TL-Glacier Ice Keycap tooling approved",
      groupBuyIndex: 5,
      minutesAgo: 4320,
    },
    {
      actionType: "group_buy_updated" as const,
      description:
        "TL-Ember Switch Set marked as fulfilled — all 445 units delivered",
      groupBuyIndex: 6,
      minutesAgo: 7200,
    },
    {
      actionType: "shop_installed" as const,
      description: "Group Buy Manager installed on Tactile Lab store",
      groupBuyIndex: -1, // shop-wide event
      minutesAgo: 10080,
    },
  ];

  for (const activity of activities) {
    await db.insert(activityLogs).values({
      id: uuidv4(),
      shopId: actualShopId,
      // groupBuyId is null for shop-wide events (groupBuyIndex === -1)
      groupBuyId:
        activity.groupBuyIndex >= 0 ? ruleIds[activity.groupBuyIndex] : null,
      actionType: activity.actionType,
      description: activity.description,
      // metadata is now a typed json column — pass an object directly, no JSON.stringify needed
      metadata: {
        source: "seed",
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(Date.now() - activity.minutesAgo * 60 * 1000),
    });
  }

  console.log("✅ Activity logs created");
  console.log("");
  console.log("🎉 Seed complete! Summary:");
  console.log(`   📦 ${groupBuys.length} Group Buys (various stages)`);
  console.log(
    `   🏭 ${groupBuys.length * ALL_STAGES.length} Manufacturing stage records`,
  );
  console.log(`   📊 ${groupBuys.length} Urgency score records`);
  console.log(`   📋 ${activities.length} Activity log entries`);
  console.log("");
  console.log("Urgency ranking:");
  console.log("   🚨 95 — TL-Carbon TKL          (Critical — QC issues)");
  console.log(
    "   🚨 88 — TL-Obsidian 65%         (Critical — ships in 28d, 14d delay)",
  );
  console.log("   ⚠️  72 — TL-Cosmos 75%           (High — 7d delay)");
  console.log("   ⚠️  62 — TL-Eclipse Pro 65%      (High — ships in 3 days)");
  console.log("   🔵 35 — TL-Glacier Ice Keycaps  (Medium)");
  console.log("   ✅ 15 — TL-Phantom 60% Wireless (Low — 167 days out)");
  console.log("   ✅  0 — TL-Ember Switch Set      (Fulfilled)");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
