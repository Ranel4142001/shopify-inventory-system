import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { scores, rules } from '../../db/schema';
import type { Score, NewScore } from '../../db/schema';

export class ScoringRepository {

  async findLatestByRuleId(ruleId: string): Promise<Score | null> {
    const result = await db
      .select()
      .from(scores)
      .where(eq(scores.ruleId, ruleId))
      .orderBy(desc(scores.createdAt))
      .limit(1);
    return result[0] ?? null;
  }

  async findAllByRuleId(ruleId: string): Promise<Score[]> {
    return db
      .select()
      .from(scores)
      .where(eq(scores.ruleId, ruleId))
      .orderBy(desc(scores.createdAt));
  }

  async create(data: NewScore): Promise<Score> {
    await db.insert(scores).values(data);
    return (await this.findLatestByRuleId(data.ruleId))!;
  }

  async updateRuleUrgencyScore(
    ruleId: string,
    urgencyScore: number
  ): Promise<void> {
    await db
      .update(rules)
      .set({ urgencyScore, updatedAt: new Date() })
      .where(eq(rules.id, ruleId));
  }

  async getAllRulesForShop(shopId: string) {
    return db
      .select()
      .from(rules)
      .where(eq(rules.shopId, shopId));
  }
}

export const scoringRepository = new ScoringRepository();