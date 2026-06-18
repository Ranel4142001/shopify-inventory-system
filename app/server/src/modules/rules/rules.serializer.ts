import type { Rule } from '../../db/schema';

export interface SerializedRuleSummary {
  id: string;
  productTitle: string;
  status: string;
  currentStage: string;
  targetShipDate: Date;
  customerCount: number;
}

export interface SerializedRuleDetails {
  id: string;
  productTitle: string;
  status: string;
  currentStage: string;
  targetShipDate: Date;
  customerCount: number;
  fundingGoal: number;
  currentFunding: number;
  notes: string | null;
  latestScore: {
    delayDays: number;
    urgencyScore: number;
  } | null;
}

export class RulesSerializer {
  serializeRuleSummary(rule: Partial<Rule>): SerializedRuleSummary {
    return {
      id: rule.id!,
      productTitle: rule.productTitle!,
      status: rule.status!,
      currentStage: rule.currentStage!,
      targetShipDate: rule.targetShipDate!,
      customerCount: rule.customerCount!,
    };
  }

  serializeRuleSummaryList(rules: Partial<Rule>[]): SerializedRuleSummary[] {
    return rules.map((r) => this.serializeRuleSummary(r));
  }

  serializeRuleDetails(rule: any): SerializedRuleDetails {
    return {
      id: rule.id,
      productTitle: rule.productTitle,
      status: rule.status,
      currentStage: rule.currentStage,
      targetShipDate: rule.targetShipDate,
      customerCount: rule.customerCount,
      fundingGoal: rule.fundingGoal,
      currentFunding: rule.currentFunding,
      notes: rule.notes ?? null,
      latestScore: rule.latestScore
        ? {
            delayDays: rule.latestScore.delayDays,
            urgencyScore: rule.latestScore.urgencyScore,
          }
        : null,
    };
  }
}

export const rulesSerializer = new RulesSerializer();
