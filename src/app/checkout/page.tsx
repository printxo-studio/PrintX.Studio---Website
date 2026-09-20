"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";
import { createCheckoutSession } from "@/lib/stripe";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shipping, tax, total, clearCart } = useCart();
  const { customer } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560001");
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "priority">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "upi" | "cod">("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill fields if customer is logged in
  useEffect(() => {
    if (customer) {
      if (customer.name && !fullName) setFullName(customer.name);
      if (customer.email && !email) setEmail(customer.email);
      if (customer.phone && !phone) setPhone(customer.phone);
      if (customer.address && !street) setStreet(customer.address);
      if (customer.city) setCity(customer.city);
      if (customer.state) setState(customer.state);
      if (customer.pincode) setPostalCode(customer.pincode);
    }
  }, [customer]);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">No items in checkout</h2>
        <p className="text-xs text-zinc-400">Please add items to your cart before proceeding.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const effectiveShipping = deliveryMethod === "priority" ? shipping + 200 : shipping;
  const grandTotal = total + (deliveryMethod === "priority" ? 200 : 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !email || !phone || !street || !city || !state || !postalCode) {
      setErrorMessage("Please complete all required shipping address fields.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Submit order to unified /api/checkout (PostgreSQL single source of truth)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({
            productId: it.productId || it.product?.id || null,
            name: it.product?.name || "Custom 3D Print Part",
            sku: it.product?.sku || null,
            price: Number(it.product?.salePrice ?? it.product?.price ?? 0),
            quantity: Number(it.quantity || 1),
            selectedColor: it.selectedColor || null,
            notes: it.notes || null,
          })),
          shippingAddress: {
            fullName,
            email,
            phone,
            street,
            city,
            state,
            postalCode,
            country: "India",
          },
          deliveryMethod,
          paymentMethod,
          discountAmount: discount,
        }),
      });

      const checkoutResult = await res.json();
      if (!res.ok || !checkoutResult.success) {
        throw new Error(checkoutResult.error || "Failed to process order");
      }

      const orderNumber = checkoutResult.orderNumber;

      // If Stripe payment selected:
      if (paymentMethod === "stripe") {
        const session = await createCheckoutSession({
          orderNumber,
          amountInINR: grandTotal,
          customerEmail: email,
          successUrl: `${window.location.origin}/checkout/success?orderNumber=${orderNumber}`,
          cancelUrl: `${window.location.origin}/checkout?canceled=true`,
        });

        clearCart();

        if (session.url) {
          window.location.href = session.url;
          return;
        }
      }

      // Instant confirmation for UPI / COD / Mock
      clearCart();
      router.push(`/checkout/success?orderNumber=${orderNumber}`);
    } catch (err: any) {
      console.error("Order processing error:", err);
      setErrorMessage(err.message || "Failed to process order. Please verify your details and try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Secure Checkout</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Precision 3D manufacturing order dispatch & delivery confirmation.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/50 flex items-center gap-3 text-red-400 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Address & Payment Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact Details */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                1. Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                2. Shipping Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Vikram Sharma"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Street & Apartment / Suite *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Flat 402, Maker Enclave, 12th Main Road"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Karnataka"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">Postal Code (PIN) *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="560038"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                3. Delivery Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setDeliveryMethod("standard")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    deliveryMethod === "standard"
                      ? "bg-red-950/40 border-red-500/80 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-red-500" />
                      <span>Standard Express</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">2-3 Business Days</div>
                  </div>
                  <span className="text-xs font-bold text-white">
                    {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryMethod("priority")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    deliveryMethod === "priority"
                      ? "bg-red-950/40 border-red-500/80 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Priority Rapid Rush</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Next-Day Dispatch & Air Shipping</div>
                  </div>
                  <span className="text-xs font-bold text-white">
                    {formatCurrency(shipping + 200)}
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                4. Payment Method
              </h3>
              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod("stripe")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "stripe"
                      ? "bg-red-950/40 border-red-500/80 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-xs font-bold text-white">Credit / Debit Card (Stripe)</div>
                      <div className="text-[11px] text-zinc-400">Visa, Mastercard, RuPay & International Cards</div>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                </label>

                <label
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "upi"
                      ? "bg-red-950/40 border-red-500/80 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-xs font-bold text-white">Instant UPI / QR Code</div>
                      <div className="text-[11px] text-zinc-400">Google Pay, PhonePe, Paytm, BHIM</div>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                </label>

                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "cod"
                      ? "bg-red-950/40 border-red-500/80 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-zinc-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Cash on Delivery / Studio Verification</div>
                      <div className="text-[11px] text-zinc-400">Verified by phone prior to 3D printing queue</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6 sticky top-24">
              <h3 className="text-base font-bold text-white pb-3 border-b border-zinc-800">
                Order Review ({items.length} {items.length === 1 ? "design" : "designs"})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                      <Image
                        src={item.product.images[0]?.url || "/logo-icon.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{item.product.name}</p>
                      <p className="text-zinc-500 text-[11px]">
                        Qty: {item.quantity} • {item.selectedColor || item.product.material}
                      </p>
                    </div>
                    <span className="font-bold text-white">
                      {formatCurrency(
                        (item.product.salePrice ?? item.product.price) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs text-zinc-400 pt-4 border-t border-zinc-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span className="text-white">
                    {effectiveShipping === 0 ? "FREE" : formatCurrency(effectiveShipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (18%)</span>
                  <span className="text-white">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-zinc-800">
                  <span>Total Due</span>
                  <span className="text-red-400 text-lg">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 glow-crimson transition-all"
              >
                {isProcessing ? (
                  <span>Securing Production Slot...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay & Queue Order • {formatCurrency(grandTotal)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>256-Bit Encrypted Studio SSL Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
