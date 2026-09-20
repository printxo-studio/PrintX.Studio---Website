import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      requestNumber,
      projectTitle,
      description,
      intendedUse,
      quantity,
      preferredMaterial,
      preferredColor,
      finish,
      targetBudget,
      deadline,
      files,
      guestName,
      guestEmail,
      guestPhone,
    } = body;

    const bosUrl = process.env.BOS_API_URL || "http://localhost:3001";

    // Prepare lead/quote payload for BOS
    const leadPayload = {
      name: guestName || "Custom 3D Printing Client",
      email: guestEmail || null,
      phone: guestPhone || null,
      source: "WEBSITE",
      requirement: `[Custom 3D Request #${requestNumber}] ${projectTitle} (${quantity} units in ${preferredMaterial || "PLA"}, finish: ${finish || "Raw"}). Intended use: ${intendedUse || "Prototyping"}. Notes: ${description || "None"}. Files: ${(files || []).map((f: any) => f.filename).join(", ")}`,
      budget: targetBudget ? parseFloat(targetBudget) : null,
      productInterest: `Custom 3D Print: ${preferredMaterial}`,
      status: "NEW",
      priority: "HIGH",
      notes: `Submitted via PrintX Studio Custom 3D Request Portal. Deadline: ${deadline || "Standard 3-5 days"}.`,
    };

    let syncedToBos = false;
    try {
      const bosRes = await fetch(`${bosUrl}/api/crm/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload),
      });
      if (bosRes.ok) syncedToBos = true;
    } catch (e) {
      console.warn("BOS sync for custom request warning:", e);
    }

    return NextResponse.json({
      success: true,
      requestNumber,
      syncedToBos,
      message: `Custom 3D print request #${requestNumber} logged and queued for studio engineering review.`,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Custom print route error:", error);
    return NextResponse.json({ error: error.message || "Failed to process custom print request" }, { status: 500 });
  }
}
