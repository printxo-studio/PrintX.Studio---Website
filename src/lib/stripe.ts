import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const isStripeConfigured =
  Boolean(stripeSecretKey) &&
  stripeSecretKey !== "sk_test_placeholder" &&
  !stripeSecretKey?.includes("placeholder");

export const stripe = isStripeConfigured
  ? new Stripe(stripeSecretKey as string, {
      apiVersion: "2025-02-24.acacia" as any,
    })
  : null;

export interface CreatePaymentSessionParams {
  orderNumber: string;
  amountInINR: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  orderNumber,
  amountInINR,
  customerEmail,
  successUrl,
  cancelUrl,
}: CreatePaymentSessionParams) {
  if (isStripeConfigured && stripe) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      client_reference_id: orderNumber,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `PrintX Studio Order #${orderNumber}`,
              description: "Precision 3D Printed Products / Custom Prototyping",
            },
            unit_amount: Math.round(amountInINR * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return { url: session.url, id: session.id, isMock: false };
  }

  // Development simulation mode:
  // When Stripe keys are not yet configured, provide instant seamless success URL
  return {
    url: `${successUrl}?mock_payment=true&order=${orderNumber}`,
    id: `mock_session_${Date.now()}`,
    isMock: true,
  };
}
