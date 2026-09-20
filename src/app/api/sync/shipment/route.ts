import { NextResponse } from "next/server";
import { saveShipment, getShipments } from "@/lib/bridge-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    const shipments = getShipments();

    if (orderNumber) {
      const shipment = shipments[orderNumber];
      if (shipment) {
        return NextResponse.json({ success: true, shipment });
      }

      // Check BOS directly if not in local cache
      const bosUrl = process.env.BOS_API_URL || "http://localhost:3001";
      try {
        const bosRes = await fetch(`${bosUrl}/api/shipping?orderNumber=${encodeURIComponent(orderNumber)}`);
        if (bosRes.ok) {
          const list = await bosRes.json();
          const match = Array.isArray(list)
            ? list.find((s: any) => s.order?.orderNumber === orderNumber)
            : null;
          if (match) {
            const mapped = {
              orderNumber,
              carrier: match.courierName,
              trackingNumber: match.trackingNumber,
              trackingUrl: match.trackingUrl || (match.trackingNumber ? `https://www.delhivery.com/track/package/${match.trackingNumber}` : null),
              status: match.status,
              shippedAt: match.shipDate,
              expectedDelivery: match.expectedDelivery,
              notes: match.notes,
            };
            saveShipment(orderNumber, mapped);
            return NextResponse.json({ success: true, shipment: mapped });
          }
        }
      } catch (e) {
        // BOS offline fallback
      }

      return NextResponse.json({
        success: true,
        shipment: {
          orderNumber,
          carrier: "PrintX Express Logistics",
          trackingNumber: `PRX-TRK-${orderNumber.slice(-4)}`,
          status: "PROCESSING",
          timeline: "In Slicing & Additive Manufacturing Queue",
        },
      });
    }

    return NextResponse.json({ success: true, count: Object.keys(shipments).length, shipments });
  } catch (error: any) {
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

    const updatedShipment = saveShipment(orderNumber, {
      orderNumber,
      carrier: carrier || "Delhivery Surface",
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || (trackingNumber ? `https://www.delhivery.com/track/package/${trackingNumber}` : null),
      status: status || "SHIPPED",
      shippedAt: shippedAt || new Date().toISOString(),
      notes: notes || "Dispatched from PrintX Studio additive manufacturing facility.",
    });

    return NextResponse.json({
      success: true,
      message: `Shipment for order ${orderNumber} synced to customer website.`,
      shipment: updatedShipment,
    });
  } catch (error: any) {
    console.error("Shipment sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to update shipment" }, { status: 500 });
  }
}
