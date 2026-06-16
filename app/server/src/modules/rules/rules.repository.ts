import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../../db/client';
import { rules, products, scores } from '../../db/schema';
import type { Rule, NewRule } from '../../db/schema';
import { getOffset } from '../../shared/utils/pagination';

export class RulesRepository {

  async findById(id: string): Promise<Rule | null> {
    const result = await db
      .select()
      .from(rules)
      .where(eq(rules.id, id))
      .limit(1);
    return result[0] ?? null;
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
        .where(eq(rules.shopId, shopId))
        .orderBy(desc(rules.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(rules)
        .where(eq(rules.shopId, shopId)),
    ]);

    return { data, total: totalResult[0]?.count ?? 0 };
  }

  async findByShopAndId(
    shopId: string,
    id: string
  ): Promise<Rule | null> {
    const result = await db
      .select()
      .from(rules)
      .where(and(eq(rules.shopId, shopId), eq(rules.id, id)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewRule): Promise<Rule> {
    await db.insert(rules).values(data);
    return (await this.findById(data.id))!;
  }

  async update(
    id: string,
    data: Partial<NewRule>
  ): Promise<Rule | null> {
    await db
      .update(rules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rules.id, id));
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await db.delete(rules).where(eq(rules.id, id));
  }

  // Get with related stages and scores
  async findWithDetails(id: string) {
    const rule = await this.findById(id);
    if (!rule) return null;

    const [stages, scoreList] = await Promise.all([
      db
        .select()
        .from(products)
        .where(eq(products.ruleId, id))
        .orderBy(products.orderIndex),
      db
        .select()
        .from(scores)
        .where(eq(scores.ruleId, id))
        .orderBy(desc(scores.createdAt))
        .limit(1),
    ]);

    return {
      ...rule,
      stages,
      latestScore: scoreList[0] ?? null,
    };
  }
}

export const rulesRepository = new RulesRepository();