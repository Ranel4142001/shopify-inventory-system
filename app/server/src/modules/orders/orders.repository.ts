import { db } from '../../db/client';
import { orders } from '../../db/schema/orders.schema';
import { rules } from '../../db/schema/rules.schema';
import { eq, sql } from 'drizzle-orm';
import { mapOrderToDbNewOrder } from '../../db/schema/mappers';

export async function createOrderTransaction(
  shopId: string, 
  ruleId: string, 
  data: { quantity: number; orderReference: string }
) {
  return await db.transaction(async (tx) => {
    // 1. Insert the order record
    const dbOrderData = mapOrderToDbNewOrder({
      id: crypto.randomUUID(),
      shopId,
      ruleId,
      quantity: data.quantity,
      orderReference: data.orderReference,
    });

    const [newOrder] = await tx.insert(orders).values(dbOrderData as any);

    // 2. Increment funding on the Rule
    await tx.update(rules)
      .set({ 
        currentFunding: sql`current_funding + ${data.quantity}` 
      })
      .where(eq(rules.publicId, ruleId));

    return newOrder;
  });
}