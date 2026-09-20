"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
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
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");

  if (!isOpen) return null;

  const freeShippingThreshold = 1499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800/80 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Your Studio Cart
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800/50">
                {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-5 py-3 bg-zinc-900/30 border-b border-zinc-800/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Truck className="w-3.5 h-3.5 text-red-400" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add{" "}
                    <strong className="text-white">
                      {formatCurrency(remainingForFreeShipping)}
                    </strong>{" "}
                    more for <span className="text-red-400 font-semibold">Free Express Delivery</span>
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

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mb-6">
                  Browse our curated 3D prints or upload a custom CAD model for instant precision manufacturing.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold text-center transition-colors"
                  >
                    Explore 3D Products
                  </Link>
                  <Link
                    href="/custom-print"
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold text-center transition-colors glow-crimson-subtle"
                  >
                    Upload Custom 3D File
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                    <Image
                      src={item.product.images[0]?.url || "/logo-icon.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {item.selectedColor && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {item.selectedColor}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">
                          {item.product.material}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                      <div className="flex items-center gap-1 bg-zinc-800/80 rounded-md p-0.5 border border-zinc-700">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white">
                          {formatCurrency(
                            (item.product.salePrice ?? item.product.price) * item.quantity
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 bg-zinc-900/80 border-t border-zinc-800 space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (e.g. WELCOME10)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Apply
                </button>
              </form>

              {coupon && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Coupon &apos;{coupon.code}&apos; applied (-{formatCurrency(discount)})
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-xs hover:underline text-zinc-400 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-400 font-medium px-1">
                  {couponError}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount</span>
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
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Due</span>
                  <span className="text-red-400 text-base">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all glow-crimson"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
