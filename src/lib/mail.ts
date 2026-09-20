export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; error?: string }> {
  const provider = process.env.EMAIL_PROVIDER || "console";

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "PrintX Studio <support@printx.studio>",
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Resend API Error:", err);
        return { success: false, error: err };
      }
      return { success: true };
    } catch (e) {
      console.error("Failed to send email via Resend:", e);
      return { success: false, error: String(e) };
    }
  }

  // Development Fallback: Structured Console Logging
  console.log("-----------------------------------------");
  console.log(`[EMAIL DISPATCH - DEV SIMULATION]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log("-----------------------------------------");
  return { success: true };
}

export function generateOrderConfirmationEmailHtml(orderNumber: string, totalAmount: number, customerName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121215; color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #27272a;">
      <h2 style="color: #e50914; margin-top: 0;">PrintX Studio - Order Confirmed!</h2>
      <p>Hello ${customerName},</p>
      <p>Thank you for choosing PrintX Studio! We have received your order <strong>#${orderNumber}</strong>.</p>
      <div style="background: #1e1e24; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;">Total Paid: <strong>₹${totalAmount.toLocaleString("en-IN")}</strong></p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">Our 3D print technicians have queued your models for production.</p>
      </div>
      <p style="font-size: 12px; color: #71717a;">PrintX Studio • Precision Additive Manufacturing</p>
    </div>
  `;
}

export function generateQuoteSentEmailHtml(requestNumber: string, totalAmount: number, customerName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121215; color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #27272a;">
      <h2 style="color: #e50914; margin-top: 0;">PrintX Studio - Your Custom 3D Print Quote is Ready!</h2>
      <p>Hello ${customerName},</p>
      <p>Our engineers have inspected your 3D CAD files for request <strong>#${requestNumber}</strong> and prepared a comprehensive manufacturing quote.</p>
      <div style="background: #1e1e24; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;">Quote Total: <strong style="color: #e50914;">₹${totalAmount.toLocaleString("en-IN")}</strong></p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">Log in to your account dashboard to review the material tolerances, accept the quote, and start production.</p>
      </div>
      <p style="font-size: 12px; color: #71717a;">PrintX Studio • Precision Additive Manufacturing</p>
    </div>
  `;
}
