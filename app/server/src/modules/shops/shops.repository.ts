import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { shops } from '../../db/schema';
import type { Shop, NewShop, DbShop, DbNewShop } from '../../db/schema';
import { mapDbShopToShop, mapShopToDbNewShop } from '../../db/schema/mappers';

export class ShopsRepository {

  async findById(id: string): Promise<Shop | null> {
    const result = await db
      .select()
      .from(shops)
      .where(eq(shops.publicId, id))
      .limit(1);
    return result[0] ? mapDbShopToShop(result[0]) : null;
  }

  async findByDomain(domain: string): Promise<Shop | null> {
    const result = await db
      .select()
      .from(shops)
      .where(eq(shops.domain, domain))
      .limit(1);
    return result[0] ? mapDbShopToShop(result[0]) : null;
  }

  async create(data: NewShop): Promise<Shop> {
    const dbData = mapShopToDbNewShop(data) as DbNewShop;
    await db.insert(shops).values(dbData);
    const created = await this.findById(data.id);
    return created!;
  }

  async update(
    id: string,
    data: Partial<NewShop>
  ): Promise<Shop | null> {
    const dbData = mapShopToDbNewShop(data);
    await db
      .update(shops)
      .set({ ...dbData, updatedAt: new Date() })
      .where(eq(shops.publicId, id));
    return this.findById(id);
  }

  async deactivate(id: string): Promise<void> {
    await db
      .update(shops)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(shops.publicId, id));
  }

  async findAll(): Promise<Shop[]> {
    const result = await db.select().from(shops);
    return result.map(mapDbShopToShop);
  }
}

export const shopsRepository = new ShopsRepository();