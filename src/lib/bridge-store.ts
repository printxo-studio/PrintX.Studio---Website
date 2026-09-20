import fs from "fs";
import path from "path";

// File-based store backup for seamless local demo and persistence
const DATA_DIR = path.resolve(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "published_products.json");
const SHIPMENTS_FILE = path.join(DATA_DIR, "shipments.json");
const ORDERS_FILE = path.join(DATA_DIR, "synced_orders.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Published Products Store
export function getPublishedProducts(): any[] {
  try {
    ensureDir();
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    const content = fs.readFileSync(PRODUCTS_FILE, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading published products:", err);
    return [];
  }
}

export function savePublishedProduct(product: any): any[] {
  ensureDir();
  const products = getPublishedProducts();
  const index = products.findIndex((p) => p.sku === product.sku || p.id === product.id || p.slug === product.slug);
  
  const formattedProduct = {
    id: product.id || `bos-${Date.now()}`,
    name: product.name,
    slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    sku: product.sku || `PRX-${Date.now().toString().slice(-4)}`,
    shortDescription: product.shortDescription || product.description || "Precision engineered 3D printed part manufactured by PrintX Studio.",
    fullDescription: product.fullDescription || product.description || "Manufactured with industrial-grade additive manufacturing technology at PrintX Studio. Layer-by-layer optical verification ensures strict dimensional tolerance.",
    price: Number(product.price || product.sellingPrice || 999),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    stockQuantity: product.stockQuantity ?? 50,
    material: product.material || product.materialName || "PLA+",
    colorOptions: product.colorOptions || ["Matte Black", "Studio Crimson", "Signal White", "Anthracite Grey"],
    dimensions: product.dimensions || "120 x 80 x 65 mm",
    productionTimeDays: product.productionTimeDays || Math.ceil(Number(product.standardPrintTimeHours || 4) / 8) || 2,
    isFeatured: Boolean(product.isFeatured),
    category: {
      id: "cat-bos",
      name: product.category || "Engineering & Functional",
      slug: (product.category || "engineering").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    },
    images: (product.images && product.images.length > 0) ? product.images : [
      { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800", altText: product.name }
    ],
    publishedAt: new Date().toISOString(),
    bosOrigin: true,
  };

  if (index >= 0) {
    products[index] = { ...products[index], ...formattedProduct };
  } else {
    products.unshift(formattedProduct);
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
  return products;
}

// Shipments Store
export function getShipments(): Record<string, any> {
  try {
    ensureDir();
    if (!fs.existsSync(SHIPMENTS_FILE)) return {};
    return JSON.parse(fs.readFileSync(SHIPMENTS_FILE, "utf8"));
  } catch (err) {
    console.error("Error reading shipments:", err);
    return {};
  }
}

export function saveShipment(orderNumber: string, shipmentData: any) {
  ensureDir();
  const shipments = getShipments();
  shipments[orderNumber] = {
    ...shipments[orderNumber],
    ...shipmentData,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(SHIPMENTS_FILE, JSON.stringify(shipments, null, 2), "utf8");
  return shipments[orderNumber];
}

// Synced Orders Store
export function getSyncedOrders(): any[] {
  try {
    ensureDir();
    if (!fs.existsSync(ORDERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
  } catch (err) {
    return [];
  }
}

export function saveSyncedOrder(order: any) {
  ensureDir();
  const orders = getSyncedOrders();
  const index = orders.findIndex((o) => o.orderNumber === order.orderNumber);
  if (index >= 0) {
    orders[index] = { ...orders[index], ...order };
  } else {
    orders.unshift(order);
  }
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  return order;
}
