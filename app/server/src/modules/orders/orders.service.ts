import * as repository from './orders.repository';
import { logActivity } from '../activity/activity.service';

export async function processOrder(
  shopId: string, 
  ruleId: string, 
  data: { quantity: number; orderReference: string }
) {
  // Execute the database transaction
  const order = await repository.createOrderTransaction(shopId, ruleId, data);

  // Log to the Activity Table
  await logActivity(
    shopId, 
    'group_buy_updated', 
    `Order ${data.orderReference} added ${data.quantity} to Group Buy ${ruleId}`
  );

  return order;
}