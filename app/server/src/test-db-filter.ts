import { db } from './db/client';
import { rules } from './db/schema';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    const res = await db.select().from(rules).where(eq(rules.shopPublicId, '50d5cf2e-f2d9-4862-898c-a97cd52b6e11')).limit(5);
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
  process.exit(0);
}
test();
