import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { scores, rules } from '../../db/schema';
import type { Score, NewScore, DbScore, DbNewScore } from '../../db/schema';
import { mapDbScoreToScore, mapScoreToDbNewScore, mapDbRuleToRule } from '../../db/schema/mappers';

export class ScoringRepository {

  async findLatestByRuleId(ruleId: string): Promise<Score | null> {
    const result = await db
      .select()
      .from(scores)
      .where(eq(scores.rulePublicId, ruleId))
      .orderBy(desc(scores.createdAt))
      .limit(1);
    return result[0] ? mapDbScoreToScore(result[0]) : null;
  }

  async findAllByRuleId(ruleId: string): Promise<Score[]> {
    const result = await db
      .select()
      .from(scores)
      .where(eq(scores.rulePublicId, ruleId))
      .orderBy(desc(scores.createdAt));
    return result.map(mapDbScoreToScore);
  }

  async getLatestScoresForShop(shopId: string) {
    const result = await db
      .select({ score: scores })
      .from(scores)
      .innerJoin(rules, eq(scores.rulePublicId, rules.publicId))
      .where(eq(rules.shopPublicId, shopId));
    
    return result.map(r => ({
      score: mapDbScoreToScore(r.score)
    }));
  }

  async create(data: NewScore): Promise<Score> {
    const dbData = mapScoreToDbNewScore(data) as DbNewScore;
    await db.insert(scores).values(dbData);
    return (await this.findLatestByRuleId(data.ruleId))!;
  }

  async updateRuleUrgencyScore(ruleId: string, urgencyScore: number): Promise<void> {
    await db
      .update(rules)
      .set({ urgencyScore, updatedAt: new Date() })
      .where(eq(rules.publicId, ruleId));
  }

  async getAllRulesForShop(shopId: string) {
    const result = await db
      .select()
      .from(rules)
      .where(eq(rules.shopPublicId, shopId));
    return result.map(mapDbRuleToRule);
  }
}

// THIS IS THE LINE THAT FIXES YOUR ERROR
export const scoringRepository = new ScoringRepository();