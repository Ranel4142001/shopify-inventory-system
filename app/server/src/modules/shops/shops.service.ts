import { shopsRepository } from "./shops.repository";
import { decrypt } from "../../shared/utils/crypto";
import { NotFoundError } from "../../shared/errors/AppError";
import type { Shop } from "../../db/schema";

export class ShopsService {
  async getShopById(id: string): Promise<Shop> {
    const shop = await shopsRepository.findById(id);
    if (!shop) throw new NotFoundError(`Shop not found: ${id}`);
    return shop;
  }

  async getShopByDomain(domain: string): Promise<Shop> {
    const shop = await shopsRepository.findByDomain(domain);
    if (!shop) throw new NotFoundError(`Shop not found: ${domain}`);
    return shop;
  }

  async getDecryptedAccessToken(shopId: string): Promise<string> {
    const shop = await this.getShopById(shopId);
    if (!shop.accessToken) {
      throw new Error(`Shop access token not found for shop: ${shopId}`);
    }
    return decrypt(shop.accessToken);
  }

  async deactivateShop(shopId: string): Promise<void> {
    await shopsRepository.deactivate(shopId);
  }

  // Safe shop data — never expose raw access token
  sanitizeShop(shop: Shop): Omit<Shop, "accessToken"> {
    const { accessToken, ...safe } = shop;
    return safe;
  }
}

export const shopsService = new ShopsService();
