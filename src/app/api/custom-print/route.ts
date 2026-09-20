import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      shippingAddress,
    } = body;

    const qty = Math.max(1, parseInt(String(quantity || 1), 10));
    const budgetNum = targetBudget ? parseFloat(String(targetBudget)) : 0;
    const unitBudget = budgetNum > 0 ? Math.round((budgetNum / qty) * 100) / 100 : 0;

    const fileSummary = (files || [])
      .map((f: any) => f.filename || f.name)
      .filter(Boolean)
      .join(", ");

    const specsNotes = [
      `[Web Custom Print #${requestNumber || Date.now()}] ${projectTitle || "Custom 3D Print"}`,
      `Specs: ${preferredMaterial || "PLA+"} | ${preferredColor || "Black"} | ${finish || "Standard"}`,
      `Intended Use: ${intendedUse || "Display / Aesthetics"}`,
      `Qty: ${qty} units`,
      budgetNum > 0 ? `Target Budget: ₹${budgetNum.toLocaleString("en-IN")}` : null,
      deadline ? `Delivery Target: ${deadline}` : null,
      fileSummary ? `CAD / Model Files: ${fileSummary}` : null,
      shippingAddress ? `Ship To: ${shippingAddress}` : null,
      description ? `Notes: ${description}` : null,
    ]
      .filter(Boolean)
      .join(" • ");

    // 1. Resolve or Create Customer in Supabase PostgreSQL
    let customer = null;
    if (guestEmail) {
      customer = await prisma.customer.findFirst({
        where: { email: guestEmail },
      });
    }

    if (!customer) {
      const custCount = await prisma.customer.count();
      const year = new Date().getFullYear();
      customer = await prisma.customer.create({
        data: {
          customerCode: `CUST-${year}-${String(custCount + 1).padStart(4, "0")}`,
          name: guestName || "Storefront Custom 3D Client",
          email: guestEmail || null,
          phone: guestPhone || null,
          address: shippingAddress || null,
          customerType: "B2C",
          source: "Website Storefront (Custom 3D Print)",
          status: "ACTIVE",
          notes: `Created from Custom 3D Quote Request #${requestNumber || ""}`,
        },
      });
    }

    // 2. Generate Quote Number: QTE-2026-XXXX
    const quoteCount = await prisma.quote.count();
    const year = new Date().getFullYear();
    const quoteNumber = `QTE-${year}-${String(quoteCount + 1).padStart(4, "0")}`;

    // 3. Create Quote in BOS Database
    const newQuote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerId: customer.id,
        date: new Date(),
        validUntil: new Date(Date.now() + 14 * 86400000), // 14 days validity
        preparedBy: "Storefront Web Instant Quoter",
        paymentTerms: "50% Advance, 50% Before Dispatch",
        deliveryEstimate: deadline || "3-5 Working Days",
        status: "DRAFT", // Appears immediately in BOS Quotations list
        notes: specsNotes,
        subtotal: budgetNum,
        taxRate: 0,
        taxAmount: 0,
        grandTotal: budgetNum,
        items: {
          create: [
            {
              name: projectTitle || "Custom 3D Printing Prototype",
              description: `${preferredMaterial || "Additive Polymer"} (${preferredColor || "Default"}, ${finish || "Cleaned"}). CAD Files: ${fileSummary || "Attached via Portal"}`,
              quantity: qty,
              unitPrice: unitBudget,
              lineTotal: budgetNum,
              material: preferredMaterial || "PLA+",
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    // 4. Create Lead in BOS CRM
    const leadCount = await prisma.lead.count();
    const leadCode = `LEAD-${year}-${String(leadCount + 1).padStart(3, "0")}`;

    const newLead = await prisma.lead.create({
      data: {
        leadCode,
        name: guestName || customer.name,
        email: guestEmail || customer.email,
        phone: guestPhone || customer.phone,
        source: "WEBSITE",
        requirement: `[Quote ${quoteNumber}] ${projectTitle || "Custom 3D Print"}. ${specsNotes}`,
        budget: budgetNum > 0 ? budgetNum : null,
        productInterest: `Custom 3D Print: ${preferredMaterial || "Additive Manufacturing"}`,
        status: "NEW",
        priority: "HIGH",
        customerId: customer.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        requestNumber,
        quoteNumber: newQuote.quoteNumber,
        leadCode: newLead.leadCode,
        customerCode: customer.customerCode,
        message: `Quote request #${newQuote.quoteNumber} created and reflected in BOS Quotations and CRM Leads.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Custom print route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process custom print request" },
      { status: 500 }
    );
  }
}
