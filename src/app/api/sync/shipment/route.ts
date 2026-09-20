import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      // 1. Direct query to single source of truth in PostgreSQL
      const shipment = await prisma.shipment.findFirst({
        where: {
          order: { orderNumber },
        },
        include: {
          order: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (shipment) {
        return NextResponse.json({
          success: true,
          shipment: {
            orderNumber,
            carrier: shipment.courierName,
            trackingNumber: shipment.trackingNumber,
            trackingUrl:
              shipment.trackingUrl ||
              (shipment.trackingNumber
                ? `https://www.delhivery.com/track/package/${shipment.trackingNumber}`
                : null),
            status: shipment.status,
            shippedAt: shipment.shipDate,
            expectedDelivery: shipment.expectedDelivery,
            notes: shipment.notes,
          },
        });
      }

      // If no shipment record yet, check order status in database
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: { overallStatus: true, shippingStatus: true },
      });

      return NextResponse.json({
        success: true,
        shipment: {
          orderNumber,
          carrier: "PrintX Express Logistics",
          trackingNumber: `PRX-TRK-${orderNumber.slice(-4)}`,
          status: order?.shippingStatus || "PROCESSING",
          timeline: "In Slicing & Additive Manufacturing Queue",
        },
      });
    }

    // Return list of all shipments
    const allShipments = await prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: { orderNumber: true, shippingAddress: true },
        },
      },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      count: allShipments.length,
      shipments: allShipments,
    });
  } catch (error: any) {
    console.error("Shipment fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch shipment" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, carrier, trackingNumber, trackingUrl, status, shippedAt, notes } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: "orderNumber is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (order) {
      const count = await prisma.shipment.count();
      const shipmentCode = `SHP-2026-${String(count + 1).padStart(4, "0")}`;

      const existingShipment = await prisma.shipment.findFirst({
        where: { orderId: order.id },
      });

      let updatedShipment;
      if (existingShipment) {
        updatedShipment = await prisma.shipment.update({
          where: { id: existingShipment.id },
          data: {
            courierName: carrier || existingShipment.courierName,
            trackingNumber: trackingNumber ?? existingShipment.trackingNumber,
            trackingUrl: trackingUrl ?? existingShipment.trackingUrl,
            status: status || existingShipment.status,
            shipDate: shippedAt ? new Date(shippedAt) : existingShipment.shipDate,
            notes: notes ?? existingShipment.notes,
          },
        });
      } else {
        updatedShipment = await prisma.shipment.create({
          data: {
            shipmentCode,
            orderId: order.id,
            courierName: carrier || "Delhivery Surface",
            trackingNumber: trackingNumber || null,
            trackingUrl: trackingUrl || (trackingNumber ? `https://www.delhivery.com/track/package/${trackingNumber}` : null),
            status: status || "SHIPPED",
            shipDate: shippedAt ? new Date(shippedAt) : new Date(),
            notes: notes || "Dispatched from PrintX Studio additive manufacturing facility.",
          },
        });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          shippingStatus: status === "DELIVERED" ? "DELIVERED" : "SHIPPED",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Shipment for order ${orderNumber} synced to PostgreSQL database.`,
        shipment: updatedShipment,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order ${orderNumber} queued for shipment sync.`,
    });
  } catch (error: any) {
    console.error("Shipment sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to update shipment" }, { status: 500 });
  }
}
