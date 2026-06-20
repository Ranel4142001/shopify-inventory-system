import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../../db/client';
import { rules, products, scores } from '../../db/schema';
import type { Rule, NewRule, DbRule, DbNewRule } from '../../db/schema';
import { getOffset } from '../../shared/utils/pagination';
import { 
  mapDbRuleToRule, 
  mapRuleToDbNewRule, 
  mapDbProductToProduct, 
  mapDbScoreToScore 
} from '../../db/schema/mappers';

export class RulesRepository {

  async findById(id: string): Promise<Rule | null> {
    const result = await db
      .select()
      .from(rules)
      .where(eq(rules.publicId, id))
      .limit(1);
    return result[0] ? mapDbRuleToRule(result[0]) : null;
  }

  async findByShopId(
    shopId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Rule[]; total: number }> {
    const offset = getOffset(page, limit);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(rules)
        .where(eq(rules.shopPublicId, shopId))
        .orderBy(desc(rules.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(rules)
        .where(eq(rules.shopPublicId, shopId)),
    ]);

    return { 
      data: data.map(mapDbRuleToRule), 
      total: totalResult[0]?.count ?? 0 
    };
  }

  async findByShopAndId(
    shopId: string,
    id: string
  ): Promise<Rule | null> {
    const result = await db
      .select()
      .from(rules)
      .where(and(
        eq(rules.shopPublicId, shopId), 
        eq(rules.publicId, id)
      ))
      .limit(1);
    return result[0] ? mapDbRuleToRule(result[0]) : null;
  }

  async create(data: NewRule): Promise<Rule> {
    const dbData = mapRuleToDbNewRule(data) as DbNewRule;
    await db.insert(rules).values(dbData);
    return (await this.findById(data.id))!;
  }

  async update(
    id: string,
    data: Partial<NewRule>
  ): Promise<Rule | null> {
    const dbData = mapRuleToDbNewRule(data);
    await db
      .update(rules)
      .set({ ...dbData, updatedAt: new Date() })
      .where(eq(rules.publicId, id));
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await db.delete(rules).where(eq(rules.publicId, id));
  }

  // Get with related stages and scores
  async findWithDetails(id: string) {
    const rule = await this.findById(id);
    if (!rule) return null;

    const [stages, scoreList] = await Promise.all([
      db
        .select()
        .from(products)
        .where(eq(products.rulePublicId, id))
        .orderBy(products.orderIndex),
      db
        .select()
        .from(scores)
        .where(eq(scores.rulePublicId, id))
        .orderBy(desc(scores.createdAt))
        .limit(1),
    ]);

    return {
      ...rule,
      stages: stages.map(mapDbProductToProduct),
      latestScore: scoreList[0] ? mapDbScoreToScore(scoreList[0]) : null,
    };
  }
}

export const rulesRepository = new RulesRepository();