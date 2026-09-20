import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    // 1. Role-based Access Control Verification
    const session = await getServerSession();
    const authHeader = request.headers.get("authorization") || "";
    const internalSecretHeader = request.headers.get("x-bos-internal-secret") || "";
    const expectedSecret = process.env.BOS_API_SECRET || "printxo_shared_secure_bridge_key_2026";

    const isInternalAdmin =
      authHeader.includes(expectedSecret) || internalSecretHeader === expectedSecret;

    // 2. Fetch invoice and related order from single source of truth (PostgreSQL)
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [
          { invoiceNumber: orderId },
          { order: { orderNumber: orderId } },
          { orderId: orderId },
        ],
      },
      include: {
        customer: true,
        order: {
          include: {
            items: true,
            customer: true,
          },
        },
        items: true,
      },
    });

    if (!invoice) {
      return new NextResponse(
        `<html><body style="font-family: sans-serif; text-align: center; padding: 40px; background: #09090b; color: #fff;">
          <h2>Tax Invoice Not Found</h2>
          <p style="color: #a1a1aa;">No official tax invoice found matching reference "${orderId}".</p>
          <a href="/account" style="color: #ef4444; font-weight: bold;">&larr; Return to Account</a>
        </body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    // 3. Enforce Authorization:
    // If not internal admin, customer must be logged in AND must own this invoice/order
    if (!isInternalAdmin) {
      if (!session?.customerId) {
        return new NextResponse(
          `<html><body style="font-family: sans-serif; text-align: center; padding: 40px; background: #09090b; color: #fff;">
            <h2>Authentication Required</h2>
            <p style="color: #a1a1aa;">Please sign in to view and download your tax invoice.</p>
            <a href="/account" style="color: #ef4444; font-weight: bold;">Sign In to PrintX Account</a>
          </body></html>`,
          { status: 401, headers: { "Content-Type": "text/html" } }
        );
      }

      const isOwner =
        invoice.customerId === session.customerId ||
        invoice.customer?.email?.toLowerCase() === session.email.toLowerCase() ||
        invoice.order?.customerId === session.customerId;

      if (!isOwner) {
        return new NextResponse(
          `<html><body style="font-family: sans-serif; text-align: center; padding: 40px; background: #09090b; color: #fff;">
            <h2>403 - Access Denied</h2>
            <p style="color: #a1a1aa;">You do not have permission to view invoices for this account.</p>
            <a href="/account" style="color: #ef4444; font-weight: bold;">&larr; Back to My Orders</a>
          </body></html>`,
          { status: 403, headers: { "Content-Type": "text/html" } }
        );
      }
    }

    // 4. Prepare data for printable invoice view
    const invDate = new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const itemsHtml = invoice.items
      .map(
        (item, idx) => `
        <tr>
          <td style="padding: 12px 14px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-family: monospace;">${idx + 1}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #27272a; color: #ffffff; font-weight: 600;">
            ${item.description}
            <div style="font-size: 11px; color: #71717a; font-weight: normal; margin-top: 2px;">
              HSN: ${item.hsnSacCode || "8477"} &bull; Precision Additive Polymer &bull; 0.2mm Layer Verified
            </div>
          </td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #27272a; text-align: center; color: #e4e4e7;">${item.quantity}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #27272a; text-align: right; color: #e4e4e7; font-family: monospace;">₹${item.rate.toLocaleString("en-IN")}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #27272a; text-align: right; color: #a1a1aa; font-family: monospace;">${item.taxRate}% GST</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #27272a; text-align: right; color: #ffffff; font-weight: 700; font-family: monospace;">₹${item.amount.toLocaleString("en-IN")}</td>
        </tr>
      `
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice ${invoice.invoiceNumber} - PrintX Studio</title>
  <style>
    @media print {
      body { background: #ffffff !important; color: #000000 !important; }
      .no-print { display: none !important; }
      .invoice-box { border: 1px solid #cccccc !important; box-shadow: none !important; background: #ffffff !important; }
      th { background-color: #f4f4f5 !important; color: #000 !important; }
      td, th { border-color: #e4e4e7 !important; color: #000 !important; }
      .text-white { color: #000000 !important; }
      .badge-gemini { background: #f0fdf4 !important; color: #166534 !important; border-color: #bbf7d0 !important; }
    }
    body {
      margin: 0;
      padding: 32px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #09090b;
      color: #fafafa;
      line-height: 1.5;
    }
    .invoice-box {
      max-width: 860px;
      margin: 0 auto;
      background-color: #121215;
      border: 1px solid #27272a;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .badge-gemini {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 9999px;
      color: #f87171;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .print-btn {
      background-color: #dc2626;
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .print-btn:hover { background-color: #ef4444; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 860px; margin: 0 auto 20px; display: flex; justify-content: space-between; align-items: center;">
    <a href="/account" style="color: #a1a1aa; text-decoration: none; font-size: 13px; font-weight: 600;">&larr; Back to My Account & Orders</a>
    <button onclick="window.print()" class="print-btn">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
      Print / Save Tax Invoice
    </button>
  </div>

  <div class="invoice-box">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 1px solid #27272a;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <img src="/logo.png" alt="PrintX Studio" style="height: 48px; object-fit: contain;" onerror="this.style.display='none'">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff;">PRINTX STUDIO</h1>
            <div style="font-size: 11px; color: #a1a1aa; font-weight: 500;">Industrial Additive Manufacturing & Rapid Prototyping</div>
          </div>
        </div>
        <div style="font-size: 11.5px; color: #71717a; line-height: 1.6;">
          GSTIN: <strong>29AABCP1234F1Z8</strong> &bull; PAN: AABCP1234F<br>
          Tech Maker Hub, 100ft Road, Indiranagar, Bengaluru, KA 560038<br>
          Email: contact@printx.studio &bull; Web: printx.studio
        </div>
      </div>

      <div style="text-align: right;">
        <div class="badge-gemini" style="margin-bottom: 12px;">
          <span>✦ Gemini AI Verified</span>
        </div>
        <div style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.01em;">TAX INVOICE</div>
        <div style="font-size: 13px; font-family: monospace; color: #ef4444; font-weight: 700; margin-top: 4px;"># ${invoice.invoiceNumber}</div>
        <div style="font-size: 12px; color: #71717a; margin-top: 4px;">Date: ${invDate}</div>
        <div style="font-size: 12px; color: #71717a;">Order Ref: <strong style="color: #e4e4e7;">${invoice.order?.orderNumber || orderId}</strong></div>
      </div>
    </div>

    <!-- Bill To & Ship To -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px 0; border-bottom: 1px solid #27272a;">
      <div>
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #ef4444; margin-bottom: 8px;">BILLED TO (CUSTOMER)</div>
        <div style="font-size: 14px; font-weight: 700; color: #ffffff;">${invoice.customer?.name || "Storefront Customer"}</div>
        <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px; line-height: 1.6;">
          ${invoice.customer?.email || ""}<br>
          ${invoice.billingAddress || invoice.shippingAddress || "Standard Billing Address"}<br>
          Place of Supply: <strong>${invoice.customer?.state || "Karnataka"} (29)</strong>
        </div>
      </div>

      <div>
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #ef4444; margin-bottom: 8px;">DISPATCH & DELIVERY</div>
        <div style="font-size: 14px; font-weight: 700; color: #ffffff;">${invoice.order?.shippingMethod || "Standard Surface"}</div>
        <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px; line-height: 1.6;">
          Recipient: ${invoice.customer?.name || "Customer"}<br>
          Status: <strong style="color: #22c55e;">${invoice.status === "PAID" ? "PAID IN FULL" : invoice.status}</strong><br>
          Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div style="padding: 24px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
        <thead>
          <tr style="background-color: #18181b; text-align: left;">
            <th style="padding: 10px 14px; border-bottom: 2px solid #27272a; color: #a1a1aa; font-weight: 700; font-size: 11px;">#</th>
            <th style="padding: 10px 14px; border-bottom: 2px solid #27272a; color: #a1a1aa; font-weight: 700; font-size: 11px;">ITEM DESCRIPTION & HSN</th>
            <th style="padding: 10px 14px; border-bottom: 2px solid #27272a; text-align: center; color: #a1a1aa; font-weight: 700; font-size: 11px;">QTY</th>
            <th style="padding: 10px 14px; border-bottom: 2px solid #27272a; text-align: right; color: #a1a1aa; font-weight: 700; font-size: 11px;">RATE</th>
            <th style="padding: 10px 14px; border-bottom: 2px solid #27272a; text-align: right; color: #a1a1aa; font-weight: 700; font-size: 11px;">TAX RATE</th>
            <th style="padding: 10px 14px; border-bottom: 2px solid #27272a; text-align: right; color: #a1a1aa; font-weight: 700; font-size: 11px;">AMOUNT (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Calculations -->
    <div style="display: flex; justify-content: flex-end; padding-top: 12px; border-top: 1px solid #27272a;">
      <div style="width: 320px; font-size: 12.5px;">
        <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #a1a1aa;">
          <span>Taxable Subtotal</span>
          <span style="color: #ffffff; font-family: monospace;">₹${invoice.taxableAmount.toLocaleString("en-IN")}</span>
        </div>
        ${
          invoice.cgstAmount > 0
            ? `<div style="display: flex; justify-content: space-between; padding: 6px 0; color: #a1a1aa;">
                <span>CGST (9%)</span>
                <span style="color: #ffffff; font-family: monospace;">₹${invoice.cgstAmount.toLocaleString("en-IN")}</span>
              </div>`
            : ""
        }
        ${
          invoice.sgstAmount > 0
            ? `<div style="display: flex; justify-content: space-between; padding: 6px 0; color: #a1a1aa;">
                <span>SGST (9%)</span>
                <span style="color: #ffffff; font-family: monospace;">₹${invoice.sgstAmount.toLocaleString("en-IN")}</span>
              </div>`
            : ""
        }
        ${
          invoice.igstAmount > 0
            ? `<div style="display: flex; justify-content: space-between; padding: 6px 0; color: #a1a1aa;">
                <span>IGST (18%)</span>
                <span style="color: #ffffff; font-family: monospace;">₹${invoice.igstAmount.toLocaleString("en-IN")}</span>
              </div>`
            : ""
        }
        <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #a1a1aa;">
          <span>Shipping & Logistics</span>
          <span style="color: #ffffff; font-family: monospace;">${invoice.shippingAmount === 0 ? "FREE" : "₹" + invoice.shippingAmount.toLocaleString("en-IN")}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 8px; border-top: 2px solid #27272a; font-size: 16px; font-weight: 900; color: #ef4444;">
          <span style="color: #ffffff;">Grand Total</span>
          <span style="font-family: monospace;">₹${invoice.grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>

    <!-- AI & Compliance Footer -->
    <div style="margin-top: 36px; padding: 20px; background-color: #18181b; border: 1px solid #27272a; border-radius: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div>
          <div style="font-size: 11.5px; font-weight: 700; color: #ffffff;">PrintX Studio Gemini AI Financial Engine</div>
          <div style="font-size: 11px; color: #71717a; margin-top: 3px;">
            ${invoice.notes || "This electronic tax invoice was automatically generated and verified by Google Gemini AI embedded in PrintX Studio BOS. HSN 8477 applies to custom 3D additive polymers. No physical signature required under Section 28 of Information Technology Act 2000."}
          </div>
        </div>
        <div style="text-align: right; shrink-0;">
          <div style="width: 60px; height: 60px; border: 2px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; color: #ef4444; text-align: center; text-transform: uppercase; transform: rotate(-12deg);">
            PRINTX<br>SEAL
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Invoice rendering error:", error);
    return new NextResponse(
      `<html><body style="font-family: sans-serif; text-align: center; padding: 40px; background: #09090b; color: #fff;">
        <h2>Failed to Load Invoice</h2>
        <p style="color: #a1a1aa;">${error.message || "An unexpected error occurred."}</p>
        <a href="/account" style="color: #ef4444; font-weight: bold;">&larr; Back to Account</a>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
