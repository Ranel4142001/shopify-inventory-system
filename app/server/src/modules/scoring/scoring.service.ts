import { v4 as uuidv4 } from 'uuid';
import { scoringRepository } from './scoring.repository';
import { rulesRepository } from '../rules/rules.repository';
import { NotFoundError } from '../../shared/errors/AppError';
import type { Rule } from '../../db/schema';

// ─── Scoring Weights ─────────────────────────────────────────────────────────
// These weights define what matters most for urgency
const WEIGHTS = {
  DAYS_UNTIL_SHIP: 0.45,   // 45% — closest deadline = highest urgency
  DELAY_PENALTY: 0.30,      // 30% — delayed group buys need immediate attention
  CUSTOMER_STAKE: 0.25,     // 25% — more customers = higher stakes
} as const;

const MAX_SCORE = 100;

export interface UrgencyResult {
  ruleId: string;
  productTitle: string;
  urgencyScore: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  daysUntilShip: number;
  delayDays: number;
  customerCount: number;
  alerts: string[];
  recommendation: string;
}

export class ScoringService {

  // ─── Core Scoring Algorithm ───────────────────────────────────────────────
  calculateUrgencyScore(rule: Rule, delayDays: number = 0): UrgencyResult {
    const now = new Date();
    const shipDate = new Date(rule.targetShipDate);
    const daysUntilShip = Math.ceil(
      (shipDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // ── Component 1: Days Until Ship (0–100) ─────────────────────────────
    // Closer to ship date = higher score
    // Overdue = max score (100)
    let daysScore: number;
    if (daysUntilShip <= 0) {
      daysScore = 100; // Overdue — maximum urgency
    } else if (daysUntilShip <= 7) {
      daysScore = 90;  // Less than 1 week
    } else if (daysUntilShip <= 14) {
      daysScore = 75;  // Less than 2 weeks
    } else if (daysUntilShip <= 30) {
      daysScore = 55;  // Less than 1 month
    } else if (daysUntilShip <= 60) {
      daysScore = 35;  // Less than 2 months
    } else if (daysUntilShip <= 90) {
      daysScore = 20;  // Less than 3 months
    } else {
      daysScore = 5;   // More than 3 months away
    }

    // ── Component 2: Delay Penalty (0–100) ───────────────────────────────
    // Any delay at all raises urgency significantly
    let delayScore: number;
    if (delayDays <= 0) {
      delayScore = 0;   // No delay — no penalty
    } else if (delayDays <= 7) {
      delayScore = 40;  // Minor delay
    } else if (delayDays <= 14) {
      delayScore = 60;  // Moderate delay
    } else if (delayDays <= 30) {
      delayScore = 80;  // Significant delay
    } else {
      delayScore = 100; // Critical delay
    }

    // ── Component 3: Customer Stake (0–100) ──────────────────────────────
    // More customers waiting = higher stakes
    const customerCount = rule.customerCount ?? 0;
    let customerScore: number;
    if (customerCount <= 0) {
      customerScore = 0;
    } else if (customerCount <= 50) {
      customerScore = 20;
    } else if (customerCount <= 100) {
      customerScore = 40;
    } else if (customerCount <= 250) {
      customerScore = 60;
    } else if (customerCount <= 500) {
      customerScore = 80;
    } else {
      customerScore = 100; // 500+ customers = maximum stake
    }

    // ── Weighted Final Score ──────────────────────────────────────────────
    const rawScore =
      daysScore * WEIGHTS.DAYS_UNTIL_SHIP +
      delayScore * WEIGHTS.DELAY_PENALTY +
      customerScore * WEIGHTS.CUSTOMER_STAKE;

    const urgencyScore = Math.min(MAX_SCORE, Math.round(rawScore));

    // ── Urgency Level ─────────────────────────────────────────────────────
    const urgencyLevel =
      urgencyScore >= 75 ? 'critical' :
      urgencyScore >= 50 ? 'high' :
      urgencyScore >= 25 ? 'medium' : 'low';

    // ── Auto-generated Alerts ─────────────────────────────────────────────
    const alerts: string[] = [];

    if (daysUntilShip <= 0) {
      alerts.push('🚨 OVERDUE: This group buy has passed its ship date');
    } else if (daysUntilShip <= 7) {
      alerts.push(`⚠️ Ships in ${daysUntilShip} day(s) — notify customers now`);
    }

    if (delayDays > 0) {
      alerts.push(
        `⏰ Delayed by ${delayDays} day(s) — customer notification required`
      );
    }

    if (customerCount >= 500) {
      alerts.push(`👥 ${customerCount} customers waiting — high impact group buy`);
    }

    if (
      rule.currentFunding > 0 &&
      rule.fundingGoal > 0 &&
      rule.currentFunding < rule.fundingGoal
    ) {
      const percent = Math.round(
        (rule.currentFunding / rule.fundingGoal) * 100
      );
      alerts.push(`💰 Funding at ${percent}% of goal`);
    }

    // ── Recommendation ────────────────────────────────────────────────────
    const recommendation =
      urgencyLevel === 'critical'
        ? 'Immediate action required — contact supplier and notify customers'
        : urgencyLevel === 'high'
        ? 'Review this group buy today and update manufacturing stage'
        : urgencyLevel === 'medium'
        ? 'Monitor closely — check for supplier updates this week'
        : 'On track — continue routine monitoring';

    return {
      ruleId: rule.id,
      productTitle: rule.productTitle,
      urgencyScore,
      urgencyLevel,
      daysUntilShip,
      delayDays,
      customerCount,
      alerts,
      recommendation,
    };
  }

  // ─── Score a single group buy and save result ─────────────────────────────
  async scoreRule(
    shopId: string,
    ruleId: string,
    delayDays: number = 0
  ): Promise<UrgencyResult> {
    const rule = await rulesRepository.findByShopAndId(shopId, ruleId);
    if (!rule) throw new NotFoundError(`Group buy not found: ${ruleId}`);

    const result = this.calculateUrgencyScore(rule, delayDays);

    // Persist score to DB
    await scoringRepository.create({
      id: uuidv4(),
      ruleId: rule.id,
      urgencyScore: result.urgencyScore,
      daysUntilShip: result.daysUntilShip,
      delayDays,
      customerCount: rule.customerCount,
      message: result.recommendation,
      reportedAt: new Date(),
      createdAt: new Date(),
    });

    return result;
  }

  // ─── Score ALL group buys for a shop and return ranked list ──────────────
  async scoreAllRules(shopId: string): Promise<UrgencyResult[]> {
    const allRules = await scoringRepository.getAllRulesForShop(shopId);

    if (!allRules.length) return [];

    // Calculate scores for all group buys
    const results = await Promise.all(
      allRules.map(async (rule) => {
        const latestScore = await scoringRepository.findLatestByRuleId(
          rule.id
        );
        const delayDays = latestScore?.delayDays ?? 0;
        return this.calculateUrgencyScore(rule, delayDays);
      })
    );

    // Sort by urgency score descending — highest urgency first
    return results.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }

  // ─── Get score history for a group buy ───────────────────────────────────
  async getScoreHistory(shopId: string, ruleId: string) {
    const rule = await rulesRepository.findByShopAndId(shopId, ruleId);
    if (!rule) throw new NotFoundError(`Group buy not found: ${ruleId}`);

    return scoringRepository.findAllByRuleId(ruleId);
  }
}

export const scoringService = new ScoringService();