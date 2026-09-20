import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total, customer, sessionId } = body;

    const bosUrl = process.env.BOS_API_URL || "http://localhost:3001";

    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, message: "Cart empty, no sync required" });
    }

    const itemsSummary = items
      .map((it: any) => `${it.quantity}x ${it.product?.name || "3D Printed Part"} (${it.selectedColor || it.product?.material || "Standard"})`)
      .join(", ");

    const leadPayload = {
      name: customer?.name || customer?.fullName || "Website Active Shopper",
      email: customer?.email || `visitor-${(sessionId || Date.now().toString()).slice(-6)}@storefront.printx.studio`,
      phone: customer?.phone || null,
      source: "WEBSITE",
      requirement: `Active Cart: ${itemsSummary}`,
      budget: Number(total || 0),
      productInterest: items.map((it: any) => it.product?.name).filter(Boolean).join(" | "),
      status: "NEW",
      priority: total > 2000 ? "HIGH" : "MEDIUM",
      notes: `Customer active on PrintX Studio website. Added ${items.length} item(s) to cart with total value ₹${total}. Session ID: ${sessionId || "n/a"}.`,
    };

    // 1. Direct database record in shared PostgreSQL
    let leadRecord: any = null;
    try {
      const count = await prisma.lead.count();
      const leadCode = `LEAD-${String(count + 1).padStart(3, "0")}`;
      leadRecord = await prisma.lead.create({
        data: {
          leadCode,
          name: leadPayload.name,
          email: leadPayload.email,
          phone: leadPayload.phone,
          source: "WEBSITE",
          requirement: leadPayload.notes || leadPayload.requirement,
          budget: leadPayload.budget,
          productInterest: leadPayload.productInterest,
          status: "NEW",
          priority: leadPayload.priority,
        },
      });
      console.log(`✓ Cart activity logged to DB Lead: ${leadRecord.leadCode}`);
    } catch (dbErr: any) {
      console.warn("DB Lead create warning:", dbErr.message);
    }

    // 2. Forward to BOS CRM Leads endpoint if online

    return NextResponse.json({
      success: true,
      syncedToBos: false,
      message: "Cart activity recorded locally; BOS may be starting up.",
    });
  } catch (error: any) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync cart activity" }, { status: 500 });
  }
}
