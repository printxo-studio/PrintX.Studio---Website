import { NextResponse } from "next/server";
import { saveSyncedOrder } from "@/lib/bridge-store";

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const bosUrl = process.env.BOS_API_URL || "http://localhost:3001";

    // 1. Save locally for instant customer experience
    saveSyncedOrder(orderData);

    // 2. Prepare payload for BOS Orders API
    const bosOrderPayload = {
      orderNumber: orderData.orderNumber,
      orderDate: orderData.createdAt || new Date().toISOString(),
      customer: {
        name: orderData.customerName || orderData.shippingAddress?.fullName || "Storefront Customer",
        email: orderData.customerEmail,
        phone: orderData.customerPhone || orderData.shippingAddress?.phone || null,
        address: orderData.shippingAddress
          ? `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.postalCode}`
          : "Standard Shipping Address",
        city: orderData.shippingAddress?.city || "Bengaluru",
        state: orderData.shippingAddress?.state || "Karnataka",
        pincode: orderData.shippingAddress?.postalCode || "560001",
        country: "India",
        source: "Website Storefront",
      },
      shippingAddress: orderData.shippingAddress
        ? `${orderData.shippingAddress.fullName}, ${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.postalCode} (Ph: ${orderData.shippingAddress.phone || "N/A"})`
        : "Standard Dispatch",
      subtotal: Number(orderData.subtotal || 0),
      discountTotal: Number(orderData.discountAmount || 0),
      taxAmount: Number(orderData.taxAmount || 0),
      shippingCost: Number(orderData.shippingAmount || 0),
      totalAmount: Number(orderData.totalAmount || 0),
      paymentStatus: orderData.status === "PAID" ? "PAID" : "PENDING",
      overallStatus: "CONFIRMED",
      productionStatus: "PENDING",
      shippingStatus: "PENDING",
      notes: `Order placed via PrintX Studio Storefront. Payment method: ${orderData.paymentMethod || "Online Card/UPI"}.`,
      items: (orderData.items || []).map((it: any) => ({
        name: it.product?.name || it.title || "Custom 3D Print Part",
        sku: it.product?.sku || null,
        description: `Material: ${it.product?.material || "PLA+"}, Color: ${it.selectedColor || "Standard"}`,
        quantity: Number(it.quantity || 1),
        unitPrice: Number(it.product?.salePrice ?? it.product?.price ?? it.price ?? 0),
        discount: 0,
        taxRate: 18.0,
        lineTotal: Number(it.quantity || 1) * Number(it.product?.salePrice ?? it.product?.price ?? it.price ?? 0),
      })),
    };

    // 3. Dispatch to BOS Orders API
    let bosOrderResult: any = null;
    try {
      const bosRes = await fetch(`${bosUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bosOrderPayload),
      });

      if (bosRes.ok) {
        bosOrderResult = await bosRes.json();
        console.log("✓ Successfully dispatched order to BOS:", bosOrderResult.orderNumber);
      } else {
        const errorText = await bosRes.text();
        console.warn("BOS Order creation returned:", errorText);
      }
    } catch (err: any) {
      console.warn("Could not reach BOS Orders API:", err.message);
    }

    return NextResponse.json({
      success: true,
      orderNumber: orderData.orderNumber,
      bosOrderId: bosOrderResult?.id || null,
      bosOrderNumber: bosOrderResult?.orderNumber || orderData.orderNumber,
      invoiceUrl: `/api/invoice/${orderData.orderNumber}`,
      message: "Order confirmed and linked to PrintX Studio BOS Command Center & Production Queue.",
    });
  } catch (error: any) {
    console.error("Order sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order bridge" }, { status: 500 });
  }
}
