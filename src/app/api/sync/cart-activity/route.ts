import { NextResponse } from "next/server";

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

    // Forward to BOS CRM Leads endpoint
    try {
      const bosRes = await fetch(`${bosUrl}/api/crm/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload),
      });

      if (bosRes.ok) {
        const bosData = await bosRes.json();
        return NextResponse.json({
          success: true,
          syncedToBos: true,
          leadCode: bosData.leadCode,
          message: "Cart intent successfully logged into BOS CRM Leads",
        });
      } else {
        const errText = await bosRes.text();
        console.warn("BOS CRM responded with non-200:", errText);
      }
    } catch (bosError: any) {
      console.warn("Could not reach BOS CRM at", bosUrl, bosError.message);
    }

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
