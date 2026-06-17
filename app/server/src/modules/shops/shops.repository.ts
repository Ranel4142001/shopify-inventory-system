import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { shops } from '../../db/schema';
import type { Shop, NewShop } from '../../db/schema';

export class ShopsRepository {

  async findById(id: string): Promise<Shop | null> {
    const result = await db
      .select()
      .from(shops)
      .where(eq(shops.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByDomain(domain: string): Promise<Shop | null> {
    const result = await db
      .select()
      .from(shops)
      .where(eq(shops.domain, domain))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewShop): Promise<Shop> {
    await db.insert(shops).values(data);
    const created = await this.findById(data.id);
    return created!;
  }

  async update(
    id: string,
    data: Partial<NewShop>
  ): Promise<Shop | null> {
    await db
      .update(shops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shops.id, id));
    return this.findById(id);
  }

  async deactivate(id: string): Promise<void> {
    await db
      .update(shops)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(shops.id, id));
  }

  async findAll(): Promise<Shop[]> {
    return db.select().from(shops);
  }
}

export const shopsRepository = new ShopsRepository();