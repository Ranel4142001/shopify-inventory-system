import { v4 as uuidv4 } from "uuid";
import { rulesRepository } from "./rules.repository";
import { NotFoundError, ForbiddenError } from "../../shared/errors/AppError";
import {
  buildPaginatedResult,
  PaginationParams,
} from "../../shared/utils/pagination";
import type { CreateRuleInput, UpdateRuleInput } from "./rules.validation";
import type { Rule } from "../../db/schema";
import { logActivity } from "../activity/activity.service";

export class RulesService {
  async getAllRules(shopId: string, pagination: PaginationParams) {
    const { data, total } = await rulesRepository.findByShopId(
      shopId,
      pagination.page,
      pagination.limit,
    );
    return buildPaginatedResult(data, total, pagination);
  }

  async getRuleById(shopId: string, ruleId: string): Promise<Rule> {
    const rule = await rulesRepository.findByShopAndId(shopId, ruleId);
    if (!rule) throw new NotFoundError(`Group buy not found: ${ruleId}`);
    return rule;
  }

  async getRuleWithDetails(shopId: string, ruleId: string) {
    const rule = await rulesRepository.findWithDetails(ruleId);
    if (!rule) throw new NotFoundError(`Group buy not found: ${ruleId}`);
    if (rule.shopId !== shopId) throw new ForbiddenError();
    return rule;
  }

  async createRule(shopId: string, input: CreateRuleInput): Promise<Rule> {
    const id = uuidv4();
    const rule = await rulesRepository.create({
      id,
      shopId,
      productTitle: input.productTitle,
      productHandle: input.productHandle ?? null,
      shopifyProductId: input.shopifyProductId ?? null,
      status: input.status,
      targetShipDate: new Date(input.targetShipDate),
      currentStage: input.currentStage,
      customerCount: input.customerCount,
      fundingGoal: input.fundingGoal,
      currentFunding: input.currentFunding,
      notes: input.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logActivity(
      shopId,
      'group_buy_created',
      `Group buy created: "${rule.productTitle}"`,
      rule.id
    );

    return rule;
  }

  async updateRule(
    shopId: string,
    ruleId: string,
    input: UpdateRuleInput,
  ): Promise<Rule> {
    // Verify ownership
    const oldRule = await this.getRuleById(shopId, ruleId);

    const updated = await rulesRepository.update(ruleId, {
      ...input,
      targetShipDate: input.targetShipDate
        ? new Date(input.targetShipDate)
        : undefined,
      updatedAt: new Date(),
    });

    const rule = updated!;

    // Determine action type and description based on changes
    let actionType: 'group_buy_updated' | 'group_buy_cancelled' | 'stage_updated' = 'group_buy_updated';
    let description = `Group buy "${rule.productTitle}" was updated`;

    if (input.status && input.status !== oldRule.status) {
      if (input.status === 'cancelled') {
        actionType = 'group_buy_cancelled';
        description = `Group buy "${rule.productTitle}" was cancelled`;
      } else {
        description = `Group buy "${rule.productTitle}" status updated to "${input.status}"`;
      }
    } else if (input.currentStage && input.currentStage !== oldRule.currentStage) {
      actionType = 'stage_updated';
      description = `Group buy "${rule.productTitle}" stage updated to "${input.currentStage}"`;
    }

    await logActivity(
      shopId,
      actionType,
      description,
      ruleId
    );

    return rule;
  }

  async deleteRule(shopId: string, ruleId: string): Promise<void> {
    await this.getRuleById(shopId, ruleId);
    await rulesRepository.delete(ruleId);
  }
}

export const rulesService = new RulesService();
