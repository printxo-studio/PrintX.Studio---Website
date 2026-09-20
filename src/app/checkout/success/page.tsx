"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Printer,
  ArrowRight,
  Truck,
  Layers,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "PXO-2026-9481";
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    try {
      const orders = JSON.parse(localStorage.getItem("printxo_customer_orders") || "[]");
      const found = orders.find((o: any) => o.orderNumber === orderNumber);
      if (found) {
        setOrder(found);
      }
    } catch (e) {
      console.error(e);
    }
  }, [orderNumber]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      {/* Top Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Payment Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Thank you for choosing PrintX Studio. Your models have been queued for precision slicing and additive manufacturing.
        </p>
        <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
          Order Reference: <strong className="text-red-400">{orderNumber}</strong>
        </div>
      </div>

      {/* Production Stepper Status */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Current Studio Status
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-semibold">
            ✓ Confirmed
          </div>
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 font-semibold animate-pulse">
            In Production
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500">
            Quality Check
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500">
            Shipped
          </div>
        </div>
      </div>

      {/* Order Details Card */}
      {order && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white">Itemized Receipt</h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">{item.product.name}</span>
                  <span className="text-zinc-500 text-[11px] block">
                    Qty: {item.quantity} • {item.selectedColor || item.product.material}
                  </span>
                </div>
                <span className="font-bold text-zinc-200">
                  {formatCurrency((item.product.salePrice ?? item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="space-y-2 text-xs text-zinc-400 pt-4 border-t border-zinc-800">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingAmount === 0 ? "FREE" : formatCurrency(order.shippingAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
              <span>Total Paid</span>
              <span className="text-red-400 text-base">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Shipping Address snapshot */}
          {order.shippingAddress && (
            <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <span className="font-bold text-zinc-300 block mb-1">Delivering To:</span>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/account/orders"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs text-center transition-colors"
        >
          Track in Customer Dashboard
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs text-center glow-crimson flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-12 text-center text-zinc-400">Loading receipt...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
