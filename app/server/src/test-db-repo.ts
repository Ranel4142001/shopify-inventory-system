import { db } from './db/client';
import { rules } from './db/schema';
import { eq, desc } from 'drizzle-orm';

async function test() {
  try {
    const shopId = '50d5cf2e-f2d9-4862-898c-a97cd52b6e11';
    const limit = 10;
    const offset = 0;
    const res = await db
      .select()
      .from(rules)
      .where(eq(rules.shopPublicId, shopId))
      .orderBy(desc(rules.createdAt))
      .limit(limit)
      .offset(offset);
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
  process.exit(0);
}
test();
