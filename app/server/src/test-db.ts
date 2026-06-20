import { db } from './db/client';
import { rules } from './db/schema';

async function test() {
  try {
    const res = await db.select().from(rules).limit(5);
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
  process.exit(0);
}
test();
