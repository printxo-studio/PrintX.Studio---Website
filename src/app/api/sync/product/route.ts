import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
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

    const sku = body.sku || `PRX-${Date.now().toString().slice(-4)}`;
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku }, { slug }] },
    });

    let product;
    if (existing) {
      product = await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: body.name,
          description: body.description || existing.description,
          sellingPrice: Number(body.price || body.sellingPrice || existing.sellingPrice),
          productionCost: Number(body.costPrice || body.productionCost || existing.productionCost),
          stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : existing.stockQuantity,
          category: body.category || existing.category,
          materialName: body.material || body.materialName || existing.materialName,
          isPublished: true,
          status: "ACTIVE",
        },
      });
    } else {
      product = await prisma.product.create({
        data: {
          sku,
          slug,
          name: body.name,
          description: body.description || "Precision engineered 3D printed component.",
          sellingPrice: Number(body.price || body.sellingPrice || 999),
          productionCost: Number(body.costPrice || body.productionCost || 250),
          stockQuantity: Number(body.stockQuantity || 50),
          category: body.category || "Functional & Engineering",
          materialName: body.material || body.materialName || "PLA+",
          isPublished: true,
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Product "${body.name}" (${sku}) published live to PrintX Studio storefront!`,
      product,
      storeUrl: `/products/${product.slug}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error publishing product:", error);
    return NextResponse.json({ error: error.message || "Failed to publish product" }, { status: 500 });
  }
}
