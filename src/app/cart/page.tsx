"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    totalItemsCount,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon,
    couponError,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
    }
  };

  const freeShippingThreshold = 1499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white">Your Cart is Empty</h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Explore our collection of precision 3D printed models or upload your own 3D CAD design for manufacturing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/products"
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
          >
            Browse Products
          </Link>
          <Link
            href="/custom-print"
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs glow-crimson"
          >
            Request Custom 3D Print
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Shopping Cart</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review your items and proceed to secure checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-red-500" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-white">{formatCurrency(remainingForFreeShipping)}</strong> more for <strong>Free Express Delivery</strong>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    ✓ You have unlocked FREE Express Delivery!
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                    <Image
                      src={item.product.images[0]?.url || "/logo-icon.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-bold text-white hover:text-red-400 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                      <span>{item.product.material}</span>
                      {item.selectedColor && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-200">{item.selectedColor}</span>
                        </>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-zinc-500 mt-1 italic line-clamp-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
                  <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(
                        (item.product.salePrice ?? item.product.price) * item.quantity
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearCart}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-white pb-3 border-b border-zinc-800">
              Order Summary
            </h3>

            {/* Coupon Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon Code"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl"
                >
                  Apply
                </button>
              </div>

              {coupon && (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Coupon &apos;{coupon.code}&apos; active (-{formatCurrency(discount)})
                  </span>
                  <button onClick={removeCoupon} className="hover:underline text-zinc-400">
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-400">{couponError}</p>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-zinc-400 pt-3 border-t border-zinc-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-zinc-800">
                <span>Total Amount</span>
                <span className="text-red-400">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 glow-crimson transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
