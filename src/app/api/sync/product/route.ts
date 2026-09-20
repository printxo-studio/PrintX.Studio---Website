import { NextResponse } from "next/server";
import { savePublishedProduct, getPublishedProducts } from "@/lib/bridge-store";

export async function GET() {
  try {
    const products = getPublishedProducts();
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch published products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const saved = savePublishedProduct(body);
    const publishedItem = saved.find(
      (p) => p.sku === body.sku || p.id === body.id || p.name === body.name
    );

    return NextResponse.json({
      success: true,
      message: `Product "${body.name}" published to PrintX Studio storefront successfully!`,
      product: publishedItem,
      storeUrl: `/products/${publishedItem?.slug || ""}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error publishing product from BOS:", error);
    return NextResponse.json({ error: error.message || "Failed to publish product" }, { status: 500 });
  }
}
