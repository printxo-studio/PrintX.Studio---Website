import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const p = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug },
        ],
        isPublished: true,
      },
      include: {
        versions: true,
      },
    });

    if (!p) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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

    const activeVersion = p.versions?.find((v) => v.active) || p.versions?.[0];

    const formatted = {
      id: p.id,
      name: p.name,
      slug: p.slug || slug,
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

    return NextResponse.json({ success: true, product: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
