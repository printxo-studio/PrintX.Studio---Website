import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const material = searchParams.get("material");
    const search = searchParams.get("search");

    // Single source of truth: only query published and active products from PostgreSQL
    const dbProducts = await prisma.product.findMany({
      where: {
        isPublished: true,
        status: { in: ["ACTIVE", "PUBLISHED", "STANDARD"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        versions: true,
      },
    });

    // Map database records to storefront Product format
    let products = dbProducts.map((p) => {
      const parsedImages = Array.isArray(p.images)
        ? (p.images as any[]).map((img: any, idx: number) => ({
            id: `img-${p.id}-${idx}`,
            url: typeof img === "string" ? img : img.url || p.imageUrl || "/logo-icon.svg",
            altText: img.altText || p.name,
            sortOrder: idx,
          }))
        : p.imageUrl
        ? [{ id: `img-${p.id}-0`, url: p.imageUrl, altText: p.name, sortOrder: 0 }]
        : [{ id: `img-${p.id}-0`, url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800", altText: p.name, sortOrder: 0 }];

      const parsedColors = Array.isArray(p.colorOptions)
        ? (p.colorOptions as string[])
        : ["Matte Black", "Studio Crimson", "Signal White", "Anthracite Grey"];

      const generatedSlug =
        p.slug ||
        p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const activeVersion = p.versions?.find((v) => v.active) || p.versions?.[0];

      return {
        id: p.id,
        name: p.name,
        slug: generatedSlug,
        sku: p.sku,
        shortDescription: p.description || "Precision engineered 3D printed component manufactured by PrintX Studio.",
        fullDescription: p.description || "Manufactured with industrial-grade additive manufacturing technology at PrintX Studio.",
        price: p.sellingPrice || 999,
        salePrice: null,
        costPrice: p.productionCost || 250,
        stockQuantity: p.stockQuantity ?? 50,
        lowStockThreshold: 5,
        material: p.materialName || "PLA+",
        colorOptions: parsedColors,
        dimensions: p.dimensions || "120 x 85 x 65 mm",
        productionTimeDays: Math.ceil(Number(p.standardPrintTimeHours || 4) / 8) || 2,
        isFeatured: true,
        isActive: p.isPublished,
        categoryId: (p.category || "engineering").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: {
          id: (p.category || "engineering").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: p.category || "Functional & Engineering",
          slug: (p.category || "engineering").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          isActive: true,
        },
        images: parsedImages,
        rating: 4.9,
        reviewsCount: 18,
        stlUrl: activeVersion?.stlFileUrl || null,
      };
    });

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (category && category !== "all") {
      products = products.filter(
        (p) =>
          p.category?.slug === category ||
          p.categoryId === category ||
          p.category?.name.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (material && material !== "all") {
      products = products.filter((p) =>
        p.material.toLowerCase().includes(material.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
