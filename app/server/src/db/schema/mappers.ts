import type {
  DbShop, DbNewShop, Shop,
  DbSession, DbNewSession, Session,
  DbRule, DbNewRule, Rule,
  DbProduct, DbNewProduct, Product,
  DbScore, DbNewScore, Score,
  DbActivityLog, DbNewActivityLog, ActivityLog,
  DbOrder, DbNewOrder, Order
} from './index';

export function mapDbShopToShop(dbShop: DbShop): Shop {
  return {
    id: dbShop.publicId,
    domain: dbShop.domain,
    accessToken: dbShop.accessToken,
    scope: dbShop.scope,
    email: dbShop.email,
    shopName: dbShop.shopName,
    isActive: dbShop.isActive,
    installedAt: dbShop.installedAt,
    updatedAt: dbShop.updatedAt,
  };
}

export function mapShopToDbNewShop(shop: Partial<Shop>): Partial<DbNewShop> {
  const dbShop: Partial<DbNewShop> = {};
  if (shop.id !== undefined) dbShop.publicId = shop.id;
  if (shop.domain !== undefined) dbShop.domain = shop.domain;
  if (shop.accessToken !== undefined) dbShop.accessToken = shop.accessToken;
  if (shop.scope !== undefined) dbShop.scope = shop.scope;
  if (shop.email !== undefined) dbShop.email = shop.email;
  if (shop.shopName !== undefined) dbShop.shopName = shop.shopName;
  if (shop.isActive !== undefined) dbShop.isActive = shop.isActive;
  if (shop.installedAt !== undefined) dbShop.installedAt = shop.installedAt;
  if (shop.updatedAt !== undefined) dbShop.updatedAt = shop.updatedAt;
  return dbShop;
}

// Session mappers
export function mapDbSessionToSession(dbSession: DbSession): Session {
  return {
    id: dbSession.publicId,
    shopId: dbSession.shopPublicId,
    accessToken: dbSession.accessToken,
    refreshToken: dbSession.refreshToken,
    expiresAt: dbSession.expiresAt,
    createdAt: dbSession.createdAt,
    updatedAt: dbSession.updatedAt,
  };
}

export function mapSessionToDbNewSession(session: Partial<Session>): Partial<DbNewSession> {
  const dbSession: Partial<DbNewSession> = {};
  if (session.id !== undefined) dbSession.publicId = session.id;
  if (session.shopId !== undefined) dbSession.shopPublicId = session.shopId;
  if (session.accessToken !== undefined) dbSession.accessToken = session.accessToken;
  if (session.refreshToken !== undefined) dbSession.refreshToken = session.refreshToken;
  if (session.expiresAt !== undefined) dbSession.expiresAt = session.expiresAt;
  if (session.createdAt !== undefined) dbSession.createdAt = session.createdAt;
  if (session.updatedAt !== undefined) dbSession.updatedAt = session.updatedAt;
  return dbSession;
}

// Rule (group buy) mappers
export function mapDbRuleToRule(dbRule: DbRule): Rule {
  return {
    id: dbRule.publicId,
    shopId: dbRule.shopPublicId,
    productTitle: dbRule.productTitle,
    productHandle: dbRule.productHandle,
    shopifyProductId: dbRule.shopifyProductId,
    status: dbRule.status,
    targetShipDate: dbRule.targetShipDate instanceof Date ? dbRule.targetShipDate : new Date(dbRule.targetShipDate),
    currentStage: dbRule.currentStage,
    customerCount: dbRule.customerCount,
    fundingGoal: dbRule.fundingGoal,
    currentFunding: dbRule.currentFunding,
    urgencyScore: dbRule.urgencyScore,
    notes: dbRule.notes,
    createdAt: dbRule.createdAt,
    updatedAt: dbRule.updatedAt,
  };
}

export function mapRuleToDbNewRule(rule: Partial<Rule>): Partial<DbNewRule> {
  const dbRule: Partial<DbNewRule> = {};
  if (rule.id !== undefined) dbRule.publicId = rule.id;
  if (rule.shopId !== undefined) dbRule.shopPublicId = rule.shopId;
  if (rule.productTitle !== undefined) dbRule.productTitle = rule.productTitle;
  if (rule.productHandle !== undefined) dbRule.productHandle = rule.productHandle;
  if (rule.shopifyProductId !== undefined) dbRule.shopifyProductId = rule.shopifyProductId;
  if (rule.status !== undefined) dbRule.status = rule.status;
  if (rule.targetShipDate !== undefined) {
    dbRule.targetShipDate = rule.targetShipDate instanceof Date 
      ? rule.targetShipDate
      : new Date(rule.targetShipDate);
  }
  if (rule.currentStage !== undefined) dbRule.currentStage = rule.currentStage;
  if (rule.customerCount !== undefined) dbRule.customerCount = rule.customerCount;
  if (rule.fundingGoal !== undefined) dbRule.fundingGoal = rule.fundingGoal;
  if (rule.currentFunding !== undefined) dbRule.currentFunding = rule.currentFunding;
  if (rule.urgencyScore !== undefined) dbRule.urgencyScore = rule.urgencyScore;
  if (rule.notes !== undefined) dbRule.notes = rule.notes;
  if (rule.createdAt !== undefined) dbRule.createdAt = rule.createdAt;
  if (rule.updatedAt !== undefined) dbRule.updatedAt = rule.updatedAt;
  return dbRule;
}

// Product (stage) mappers
export function mapDbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.publicId,
    ruleId: dbProduct.rulePublicId,
    stageName: dbProduct.stageName,
    orderIndex: dbProduct.orderIndex,
    expectedDate: dbProduct.expectedDate instanceof Date ? dbProduct.expectedDate : new Date(dbProduct.expectedDate),
    actualDate: dbProduct.actualDate ? (dbProduct.actualDate instanceof Date ? dbProduct.actualDate : new Date(dbProduct.actualDate)) : null,
    status: dbProduct.status,
    createdAt: dbProduct.createdAt,
    updatedAt: dbProduct.updatedAt,
  };
}

export function mapProductToDbNewProduct(product: Partial<Product>): Partial<DbNewProduct> {
  const dbProduct: Partial<DbNewProduct> = {};
  if (product.id !== undefined) dbProduct.publicId = product.id;
  if (product.ruleId !== undefined) dbProduct.rulePublicId = product.ruleId;
  if (product.stageName !== undefined) dbProduct.stageName = product.stageName;
  if (product.orderIndex !== undefined) dbProduct.orderIndex = product.orderIndex;
  if (product.expectedDate !== undefined) {
    dbProduct.expectedDate = product.expectedDate instanceof Date
      ? product.expectedDate
      : new Date(product.expectedDate);
  }
  if (product.actualDate !== undefined) {
    dbProduct.actualDate = product.actualDate 
      ? (product.actualDate instanceof Date ? product.actualDate : new Date(product.actualDate))
      : null;
  }
  if (product.status !== undefined) dbProduct.status = product.status;
  if (product.createdAt !== undefined) dbProduct.createdAt = product.createdAt;
  if (product.updatedAt !== undefined) dbProduct.updatedAt = product.updatedAt;
  return dbProduct;
}

// Score mappers
export function mapDbScoreToScore(dbScore: DbScore): Score {
  return {
    id: dbScore.publicId,
    ruleId: dbScore.rulePublicId,
    urgencyScore: dbScore.urgencyScore,
    daysUntilShip: dbScore.daysUntilShip,
    delayDays: dbScore.delayDays,
    customerCount: dbScore.customerCount,
    message: dbScore.message,
    reportedAt: dbScore.reportedAt,
    createdAt: dbScore.createdAt,
  };
}

export function mapScoreToDbNewScore(score: Partial<Score>): Partial<DbNewScore> {
  const dbScore: Partial<DbNewScore> = {};
  if (score.id !== undefined) dbScore.publicId = score.id;
  if (score.ruleId !== undefined) dbScore.rulePublicId = score.ruleId;
  if (score.urgencyScore !== undefined) dbScore.urgencyScore = score.urgencyScore;
  if (score.daysUntilShip !== undefined) dbScore.daysUntilShip = score.daysUntilShip;
  if (score.delayDays !== undefined) dbScore.delayDays = score.delayDays;
  if (score.customerCount !== undefined) dbScore.customerCount = score.customerCount;
  if (score.message !== undefined) dbScore.message = score.message;
  if (score.reportedAt !== undefined) dbScore.reportedAt = score.reportedAt;
  if (score.createdAt !== undefined) dbScore.createdAt = score.createdAt;
  return dbScore;
}

// ActivityLog mappers
export function mapDbActivityLogToActivityLog(dbLog: DbActivityLog): ActivityLog {
  return {
    id: dbLog.publicId,
    shopId: dbLog.shopPublicId,
    groupBuyId: dbLog.groupBuyPublicId ? dbLog.groupBuyPublicId : null,
    actionType: dbLog.actionType,
    description: dbLog.description,
    metadata: dbLog.metadata as Record<string, unknown> | null,
    createdAt: dbLog.createdAt,
  };
}

export function mapActivityLogToDbNewActivityLog(log: Partial<ActivityLog>): Partial<DbNewActivityLog> {
  const dbLog: Partial<DbNewActivityLog> = {};
  if (log.id !== undefined) dbLog.publicId = log.id;
  if (log.shopId !== undefined) dbLog.shopPublicId = log.shopId;
  if (log.groupBuyId !== undefined) {
    dbLog.groupBuyPublicId = log.groupBuyId ? log.groupBuyId : null;
  }
  if (log.actionType !== undefined) dbLog.actionType = log.actionType;
  if (log.description !== undefined) dbLog.description = log.description;
  if (log.metadata !== undefined) dbLog.metadata = log.metadata;
  if (log.createdAt !== undefined) dbLog.createdAt = log.createdAt;
  return dbLog;
}

// Order mappers
export function mapDbOrderToOrder(dbOrder: DbOrder): Order {
  return {
    id: dbOrder.publicId,
    shopId: dbOrder.shopPublicId,
    ruleId: dbOrder.rulePublicId,
    quantity: dbOrder.quantity,
    orderReference: dbOrder.orderReference,
    createdAt: dbOrder.createdAt,
  };
}

export function mapOrderToDbNewOrder(order: Partial<Order>): Partial<DbNewOrder> {
  const dbOrder: Partial<DbNewOrder> = {};
  if (order.id !== undefined) dbOrder.publicId = order.id;
  if (order.shopId !== undefined) dbOrder.shopPublicId = order.shopId;
  if (order.ruleId !== undefined) dbOrder.rulePublicId = order.ruleId;
  if (order.quantity !== undefined) dbOrder.quantity = order.quantity;
  if (order.orderReference !== undefined) dbOrder.orderReference = order.orderReference;
  if (order.createdAt !== undefined) dbOrder.createdAt = order.createdAt;
  return dbOrder;
}
