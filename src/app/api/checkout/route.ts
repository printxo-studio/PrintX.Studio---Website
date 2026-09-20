import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { z } from "zod";

const CheckoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().optional().nullable(),
      name: z.string(),
      sku: z.string().optional().nullable(),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
      selectedColor: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })
  ).min(1, "Cart cannot be empty"),
  shippingAddress: z.object({
    fullName: z.string().min(2, "Full name required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(8, "Phone number required"),
    street: z.string().min(3, "Street address required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    postalCode: z.string().min(3, "Postal code required"),
    country: z.string().default("India"),
  }),
  deliveryMethod: z.enum(["standard", "priority"]).default("standard"),
  paymentMethod: z.enum(["stripe", "upi", "cod"]).default("stripe"),
  discountAmount: z.number().optional().default(0),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CheckoutSchema.parse(body);

    const session = await getServerSession();
    let customerId = session?.customerId;

    const emailNormalized = validated.shippingAddress.email.trim().toLowerCase();

    // 1. Resolve or create Customer in PostgreSQL
    if (!customerId) {
      let existingCustomer = await prisma.customer.findFirst({
        where: { email: { equals: emailNormalized, mode: "insensitive" } },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const count = await prisma.customer.count();
        const customerCode = `CUST-${String(count + 1).padStart(3, "0")}`;
        const newCustomer = await prisma.customer.create({
          data: {
            customerCode,
            name: validated.shippingAddress.fullName.trim(),
            email: emailNormalized,
            phone: validated.shippingAddress.phone.trim(),
            address: validated.shippingAddress.street.trim(),
            city: validated.shippingAddress.city.trim(),
            state: validated.shippingAddress.state.trim(),
            pincode: validated.shippingAddress.postalCode.trim(),
            country: validated.shippingAddress.country || "India",
            customerType: "B2C",
            source: "Website Storefront",
            status: "ACTIVE",
          },
        });
        customerId = newCustomer.id;
      }
    }

    // 2. Calculate Order Totals
    const subtotal = validated.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discountTotal = validated.discountAmount || 0;
    const taxableSubtotal = Math.max(0, subtotal - discountTotal);

    // Standard shipping: Free if subtotal >= 1499 else 149; Priority: +200
    let shippingCost = subtotal >= 1499 ? 0 : 149;
    if (validated.deliveryMethod === "priority") {
      shippingCost += 200;
    }

    // Check system config for GST setting
    const sysConfig = await prisma.setting.findUnique({
      where: { key: "PRINTXO_SYSTEM_CONFIG" },
    });
    let isGstEnabled = false;
    if (sysConfig?.value) {
      try {
        const parsed = JSON.parse(sysConfig.value);
        isGstEnabled = parsed.gstEnabled === true;
      } catch (e) {}
    }

    const taxAmount = isGstEnabled ? Math.round((taxableSubtotal + shippingCost) * 0.18) : 0;
    const grandTotal = taxableSubtotal + shippingCost + taxAmount;

    // 3. Generate Order Number (e.g. ORD-2026-0042)
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-2026-${String(orderCount + 1).padStart(4, "0")}`;

    const formattedAddress = `${validated.shippingAddress.fullName}, ${validated.shippingAddress.street}, ${validated.shippingAddress.city}, ${validated.shippingAddress.state} - ${validated.shippingAddress.postalCode} (Ph: ${validated.shippingAddress.phone})`;
    const shippingMethodName =
      validated.deliveryMethod === "priority"
        ? "Priority Express Air"
        : "Standard Surface Logistics";

    // 3.5. Verify valid product IDs in Database (avoid foreign key violation for custom/mock items)
    const candidateProductIds = validated.items
      .map((it) => it.productId)
      .filter((id): id is string => Boolean(id));

    const existingProducts = candidateProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: candidateProductIds } },
          select: { id: true },
        })
      : [];
    const validProductIdSet = new Set(existingProducts.map((p) => p.id));

    // 4. Create Order & OrderItems in Database
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        orderDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 86400000),
        priority: validated.deliveryMethod === "priority" ? "HIGH" : "NORMAL",
        subtotal,
        discountTotal,
        taxAmount,
        shippingCost,
        totalAmount: grandTotal,
        paymentStatus: "PAID",
        productionStatus: "PENDING",
        qcStatus: "PENDING",
        shippingStatus: "PENDING",
        overallStatus: "CONFIRMED",
        shippingAddress: formattedAddress,
        shippingMethod: shippingMethodName,
        notes: `Placed via Storefront. Payment: ${validated.paymentMethod.toUpperCase()}. Delivery: ${shippingMethodName}.`,
        items: {
          create: validated.items.map((item) => {
            const verifiedProductId =
              item.productId && validProductIdSet.has(item.productId)
                ? item.productId
                : null;
            return {
              productId: verifiedProductId,
              name: item.name,
              sku: item.sku || null,
              description: item.selectedColor ? `Color: ${item.selectedColor}` : null,
              quantity: item.quantity,
              unitPrice: item.price,
              discount: 0,
              taxRate: isGstEnabled ? 18.0 : 0.0,
              lineTotal: item.price * item.quantity,
            };
          }),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // 5. Decrement Stock Quantities for Products
    for (const it of validated.items) {
      if (it.productId) {
        try {
          await prisma.product.update({
            where: { id: it.productId },
            data: {
              stockQuantity: { decrement: it.quantity },
            },
          });
        } catch (stockErr) {
          console.warn("Stock decrement warning for product", it.productId, stockErr);
        }
      }
    }

    // 6. Generate Invoice in PostgreSQL
    const invCount = await prisma.invoice.count();
    const invoiceNumber = `INV-2026-${String(invCount + 1).padStart(4, "0")}`;

    const isIntraState =
      !validated.shippingAddress.state ||
      validated.shippingAddress.state.toLowerCase().includes("karnataka");

    const cgstAmount = isGstEnabled && isIntraState ? Math.round(taxAmount / 2) : 0;
    const sgstAmount = isGstEnabled && isIntraState ? taxAmount - cgstAmount : 0;
    const igstAmount = isGstEnabled && !isIntraState ? taxAmount : 0;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: newOrder.id,
        customerId,
        billingAddress: formattedAddress,
        shippingAddress: formattedAddress,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 86400000),
        subtotal,
        discountTotal,
        taxableAmount: taxableSubtotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        shippingAmount: shippingCost,
        grandTotal,
        amountPaid: grandTotal,
        balanceDue: 0,
        status: "ISSUED",
        notes: isGstEnabled
          ? `Official electronic GST tax invoice for Order ${orderNumber}. HSN 8477 applies to custom 3D polymers.`
          : `Official commercial invoice & fulfillment record for Order ${orderNumber}. HSN 8477 applies to custom 3D polymers.`,
        items: {
          create: validated.items.map((it) => ({
            description: `${it.name}${it.selectedColor ? ` (${it.selectedColor})` : ""}`,
            hsnSacCode: "8477",
            quantity: it.quantity,
            rate: it.price,
            discount: 0,
            taxRate: isGstEnabled ? 18.0 : 0.0,
            amount: it.price * it.quantity,
          })),
        },
      },
    });

    // 7. Create Payment Record
    const payCount = await prisma.payment.count();
    const paymentCode = `PAY-2026-${String(payCount + 1).padStart(4, "0")}`;
    await prisma.payment.create({
      data: {
        paymentCode,
        invoiceId: newInvoice.id,
        customerId,
        amount: grandTotal,
        paymentDate: new Date(),
        paymentMethod: validated.paymentMethod.toUpperCase(),
        referenceNumber: `TXN-${Date.now().toString(36).toUpperCase()}`,
        status: "CONFIRMED",
        notes: `Storefront payment via ${validated.paymentMethod.toUpperCase()}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order placed and confirmed successfully!",
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      invoiceNumber: newInvoice.invoiceNumber,
      invoiceUrl: `/api/invoice/${newOrder.orderNumber}`,
      totalAmount: grandTotal,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Checkout order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
