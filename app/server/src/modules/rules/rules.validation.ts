import { z } from 'zod';

export const createRuleSchema = z.object({
  productTitle: z.string().min(1, 'Product title is required').max(255),
  productHandle: z.string().optional(),
  shopifyProductId: z.string().optional(),
  status: z.enum([
    'open',
    'closed',
    'in_production',
    'quality_check',
    'shipping',
    'fulfilled',
    'cancelled',
  ]).default('open'),
  targetShipDate: z.string().min(1, 'Target ship date is required'),
  currentStage: z.string().default('Funding'),
  customerCount: z.number().min(0).default(0),
  fundingGoal: z.number().min(0).default(0),
  currentFunding: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const updateRuleSchema = createRuleSchema.partial();

export const addSupplierUpdateSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  delayDays: z.number().min(0).default(0),
});

export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;
export type AddSupplierUpdateInput = z.infer<typeof addSupplierUpdateSchema>;