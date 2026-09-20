import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.customerId },
      orderBy: { orderDate: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                materialName: true,
                imageUrl: true,
                images: true,
              },
            },
          },
        },
        shipments: {
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            grandTotal: true,
            status: true,
            invoiceDate: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Fetch customer orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
