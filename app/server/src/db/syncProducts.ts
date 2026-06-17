import { db } from './client';
import { shops, rules } from './schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '../shared/utils/tokenManager';
import { shopifyRestRequest } from '../shared/utils/shopifyClient';

interface ShopifyProduct {
  id: number;
  title: string;
  product_type: string;
  vendor: string;
}

interface ShopifyProductListResponse {
  products: ShopifyProduct[];
}

interface ShopifyProductCreateResponse {
  product: {
    id: number;
    title: string;
    handle: string;
  };
}

const PRODUCTS_TO_CREATE = [
  {
    title: 'TL-Obsidian 65% Keyboard',
    body_html: '<strong>A premium 65% mechanical keyboard designed for enthusiasts.</strong> Features a sleek CNC aluminum case, hot-swappable PCB, and custom gaskets for an incredibly tactile typing experience.',
    vendor: 'Tactile Lab',
    product_type: 'mechanical-keyboard',
    tags: 'configurator, group-buy, mechanical-keyboard',
    variants: [
      {
        option1: 'Obsidian Black Base',
        price: '149.00',
        sku: 'TL-OB-65-BLK',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      },
      {
        option1: 'Titanium Silver Base',
        price: '159.00',
        sku: 'TL-OB-65-SLV',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      },
      {
        option1: 'Ember Bronze Base',
        price: '169.00',
        sku: 'TL-OB-65-BRZ',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      }
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80' },
      { src: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80' },
      { src: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    title: 'TL-Cosmos 75% Aluminum',
    body_html: '<strong>A solid 75% aluminum keyboard base with high-end brass weights.</strong> Designed with an ultra-low profile and optimized plate acoustics.',
    vendor: 'Tactile Lab',
    product_type: 'mechanical-keyboard',
    tags: 'group-buy, new, mechanical-keyboard',
    variants: [
      {
        price: '189.00',
        sku: 'TL-CS-75-BASE',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      }
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    title: 'TL-Carbon TKL',
    body_html: '<strong>A lightweight carbon-fiber TKL (tenkeyless) layout keyboard base.</strong> Incredibly crisp key press response and zero flex.',
    vendor: 'Tactile Lab',
    product_type: 'mechanical-keyboard',
    tags: 'group-buy, mechanical-keyboard',
    variants: [
      {
        price: '169.00',
        sku: 'TL-CB-TKL-BASE',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      }
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    title: 'TL-Phantom 60% Wireless',
    body_html: '<strong>Ultra-compact 60% layout mechanical keyboard.</strong> Low-latency Bluetooth and 2.4Ghz wireless connectivity, hot-swappable sockets, and custom RGB lighting matrices.',
    vendor: 'Tactile Lab',
    product_type: 'mechanical-keyboard',
    tags: 'group-buy, new, mechanical-keyboard',
    variants: [
      {
        price: '129.00',
        sku: 'TL-PH-60-WRLS',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      }
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1626908013351-800ddd734b8a?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    title: 'TL-Eclipse Pro 65%',
    body_html: '<strong>High-end professional keyboard base.</strong> Premium translucent polycarbonate case, custom brass plate, and gold-plated stabilizers.',
    vendor: 'Tactile Lab',
    product_type: 'mechanical-keyboard',
    tags: 'group-buy, mechanical-keyboard',
    variants: [
      {
        price: '199.00',
        sku: 'TL-EC-65-PRO',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      }
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    title: 'TL-Glacier Ice Keycap Set',
    body_html: '<strong>Premium double-shot PBT keycap set featuring a frosted glacier ice theme.</strong> Clean legends and standard Cherry profile.',
    vendor: 'Tactile Lab',
    product_type: 'accessories',
    tags: 'accessories, keycaps, new',
    variants: [
      {
        price: '49.00',
        sku: 'TL-ACC-GLAC-KEY',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      }
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    title: 'TL-Ember Switch Set (Linear)',
    body_html: '<strong>Pre-lubed linear switches (pack of 90).</strong> Features a smooth travel, 45g actuation force, and a satisfying deep typing sound.',
    vendor: 'Tactile Lab',
    product_type: 'accessories',
    tags: 'accessories, switches',
    variants: [
      {
        price: '29.00',
        sku: 'TL-ACC-EMB-SWT',
        inventory_management: 'shopify',
        inventory_quantity: 100,
      }
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80' }
    ]
  }
];

async function syncProducts() {
  console.log('🔄 Starting Shopify product sync...');

  // Get first shop in the DB
  const shopList = await db.select().from(shops).limit(1);
  if (shopList.length === 0) {
    console.error('❌ No shops found in database. Please install and authorize the app first.');
    process.exit(1);
  }

  const shop = shopList[0];
  const accessToken = decrypt(shop.accessToken);
  console.log(`✅ Found shop: ${shop.domain}`);

  // 1. Fetch current products
  let currentProducts: ShopifyProduct[] = [];
  try {
    const res = await shopifyRestRequest<ShopifyProductListResponse>(
      shop.domain,
      accessToken,
      'products.json'
    );
    currentProducts = res.products;
    console.log(`📦 Found ${currentProducts.length} products on store.`);
  } catch (error: any) {
    console.error('❌ Failed to fetch products:', error.message);
    process.exit(1);
  }

  // 2. Delete skateboard/snowboard default products
  const toDelete = currentProducts.filter(p => {
    const titleLower = p.title.toLowerCase();
    const typeLower = (p.product_type || '').toLowerCase();
    const vendorLower = (p.vendor || '').toLowerCase();
    return (
      titleLower.includes('snowboard') ||
      titleLower.includes('ski') ||
      titleLower.includes('wax') ||
      typeLower.includes('snowboard') ||
      vendorLower.includes('vendor')
    );
  });

  if (toDelete.length > 0) {
    console.log(`🗑️ Deleting ${toDelete.length} snowboard/skateboard default products...`);
    for (const p of toDelete) {
      try {
        await shopifyRestRequest(
          shop.domain,
          accessToken,
          `products/${p.id}.json`,
          'DELETE'
        );
        console.log(`   Deleted product: ${p.title}`);
      } catch (error: any) {
        console.error(`   Failed to delete ${p.title}:`, error.message);
      }
    }
  } else {
    console.log('✨ No snowboard/skateboard default products to delete.');
  }

  // 3. Create Keyboard products and link them to rules
  console.log('🆕 Creating custom mechanical keyboard products...');
  for (const prodData of PRODUCTS_TO_CREATE) {
    // Check if product with this title already exists in the store to avoid duplicates
    const alreadyExists = currentProducts.find(
      p => p.title.toLowerCase() === prodData.title.toLowerCase()
    );

    let shopifyId: string | null = null;
    let handle: string = '';

    if (alreadyExists) {
      shopifyId = String(alreadyExists.id);
      handle = prodData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log(`⚠️ Product "${prodData.title}" already exists on store. Linking to DB...`);
    } else {
      try {
        const createRes = await shopifyRestRequest<ShopifyProductCreateResponse>(
          shop.domain,
          accessToken,
          'products.json',
          'POST',
          { product: prodData }
        );
        shopifyId = String(createRes.product.id);
        handle = createRes.product.handle;
        console.log(`   Created product: ${createRes.product.title} (ID: ${shopifyId})`);
      } catch (error: any) {
        console.error(`   ❌ Failed to create "${prodData.title}":`, error.message);
        continue;
      }
    }

    // Update rule in DB
    if (shopifyId) {
      try {
        const updateRes = await db
          .update(rules)
          .set({
            shopifyProductId: shopifyId,
            productHandle: handle,
            updatedAt: new Date()
          })
          .where(eq(rules.productTitle, prodData.title));
        console.log(`   🔗 Linked product "${prodData.title}" in DB rules table.`);
      } catch (error: any) {
        console.error(`   ❌ Failed to link "${prodData.title}" in DB:`, error.message);
      }
    }
  }

  console.log('🎉 Sync complete! Shopify products are fully configured.');
  process.exit(0);
}

syncProducts().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
