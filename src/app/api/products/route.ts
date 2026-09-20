import { NextResponse } from "next/server";
import { getPublishedProducts } from "@/lib/bridge-store";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const material = searchParams.get("material");
    const search = searchParams.get("search");

    const bosPublished = getPublishedProducts();
    const existingSkus = new Set(INITIAL_PRODUCTS.map((p) => p.sku || p.id));
    const newItems = bosPublished.filter((p) => !existingSkus.has(p.sku || p.id));
    let combined = [...newItems, ...INITIAL_PRODUCTS];

    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q)
      );
    }

    if (category && category !== "all") {
      combined = combined.filter(
        (p) =>
          p.category?.slug === category ||
          p.categoryId === category ||
          p.category?.name?.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (material && material !== "all") {
      combined = combined.filter((p) =>
        p.material?.toLowerCase().includes(material.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      total: combined.length,
      products: combined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
