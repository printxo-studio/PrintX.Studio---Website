import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const bosUrl = process.env.BOS_API_URL || "http://localhost:3001";
    const bosSecret = process.env.BOS_API_SECRET || "printxo_shared_secure_bridge_key_2026";

    // 1. Resolve or Create Customer in PostgreSQL
    const email = (orderData.customerEmail || orderData.customer?.email || "").trim().toLowerCase();
    let customer = email
      ? await prisma.customer.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        })
      : null;

    if (!customer) {
      const count = await prisma.customer.count();
      const customerCode = `CUST-${String(count + 1).padStart(3, "0")}`;
      customer = await prisma.customer.create({
        data: {
          customerCode,
          name: orderData.customerName || orderData.shippingAddress?.fullName || "Storefront Customer",
          email: email || null,
          phone: orderData.customerPhone || orderData.shippingAddress?.phone || null,
          address: orderData.shippingAddress?.street || null,
          city: orderData.shippingAddress?.city || "Bengaluru",
          state: orderData.shippingAddress?.state || "Karnataka",
          pincode: orderData.shippingAddress?.postalCode || "560001",
          country: "India",
          customerType: "B2C",
          source: "Website Storefront",
          status: "ACTIVE",
        },
      });
    }

    // 2. Check if Order already exists or create it
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: orderData.orderNumber },
    });

    let savedOrder = existingOrder;
    if (!existingOrder) {
      const formattedAddress = orderData.shippingAddress
        ? `${orderData.shippingAddress.fullName || orderData.customerName}, ${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.postalCode} (Ph: ${orderData.shippingAddress.phone || "N/A"})`
        : "Standard Dispatch";

      savedOrder = await prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          customerId: customer.id,
          orderDate: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
          dueDate: new Date(Date.now() + 7 * 86400000),
          subtotal: Number(orderData.subtotal || 0),
          discountTotal: Number(orderData.discountAmount || 0),
          taxAmount: Number(orderData.taxAmount || 0),
          shippingCost: Number(orderData.shippingAmount || 0),
          totalAmount: Number(orderData.totalAmount || 0),
          paymentStatus: orderData.status === "PAID" ? "PAID" : "PENDING",
          overallStatus: "CONFIRMED",
          productionStatus: "PENDING",
          shippingStatus: "PENDING",
          shippingAddress: formattedAddress,
          shippingMethod: "Standard Surface Logistics",
          notes: `Order placed via PrintX Studio Storefront.`,
          items: {
            create: (orderData.items || []).map((it: any) => ({
              productId: it.productId || it.product?.id || null,
              name: it.product?.name || it.name || "Custom 3D Print Part",
              sku: it.product?.sku || it.sku || null,
              description: `Material: ${it.product?.material || "PLA+"}, Color: ${it.selectedColor || "Standard"}`,
              quantity: Number(it.quantity || 1),
              unitPrice: Number(it.product?.salePrice ?? it.product?.price ?? it.price ?? 0),
              discount: 0,
              taxRate: 18.0,
              lineTotal: Number(it.quantity || 1) * Number(it.product?.salePrice ?? it.product?.price ?? it.price ?? 0),
            })),
          },
        },
      });

      // Auto-create Invoice if not existing
      const invCount = await prisma.invoice.count();
      const invoiceNumber = `INV-2026-${String(invCount + 1).padStart(4, "0")}`;
      await prisma.invoice.create({
        data: {
          invoiceNumber,
          orderId: savedOrder.id,
          customerId: customer.id,
          billingAddress: formattedAddress,
          shippingAddress: formattedAddress,
          subtotal: savedOrder.subtotal,
          discountTotal: savedOrder.discountTotal,
          taxableAmount: Math.max(0, savedOrder.subtotal - savedOrder.discountTotal),
          cgstAmount: Math.round(savedOrder.taxAmount / 2),
          sgstAmount: savedOrder.taxAmount - Math.round(savedOrder.taxAmount / 2),
          shippingAmount: savedOrder.shippingCost,
          grandTotal: savedOrder.totalAmount,
          amountPaid: savedOrder.totalAmount,
          balanceDue: 0,
          status: "ISSUED",
          dueDate: new Date(Date.now() + 15 * 86400000),
          items: {
            create: (orderData.items || []).map((it: any) => ({
              description: it.product?.name || it.name || "3D Printed Product",
              hsnSacCode: "8477",
              quantity: Number(it.quantity || 1),
              rate: Number(it.product?.salePrice ?? it.product?.price ?? it.price ?? 0),
              amount: Number(it.quantity || 1) * Number(it.product?.salePrice ?? it.product?.price ?? it.price ?? 0),
            })),
          },
        },
      });
    }

    // 3. Notify BOS API if online (non-blocking)
    try {
      fetch(`${bosUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bos-internal-secret": bosSecret,
        },
        body: JSON.stringify(orderData),
      }).catch(() => {});
    } catch (e) {}

    return NextResponse.json({
      success: true,
      orderNumber: orderData.orderNumber,
      bosOrderId: savedOrder?.id || null,
      bosOrderNumber: savedOrder?.orderNumber || orderData.orderNumber,
      invoiceUrl: `/api/invoice/${orderData.orderNumber}`,
      message: "Order confirmed and linked to PrintX Studio BOS single source of truth.",
    });
  } catch (error: any) {
    console.error("Order sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order bridge" }, { status: 500 });
  }
}
