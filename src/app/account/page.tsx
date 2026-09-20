"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Layers,
  Heart,
  User,
  Clock,
  CheckCircle2,
  ChevronRight,
  Printer,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  FileText,
  Truck,
} from "lucide-react";
import { SAMPLE_CUSTOM_REQUESTS, INITIAL_PRODUCTS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useWishlist, useCart } from "@/lib/store";

export default function AccountDashboardPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "quotes" | "wishlist" | "profile">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<Record<string, any>>({});
  const [customRequests, setCustomRequests] = useState<any[]>(SAMPLE_CUSTOM_REQUESTS);
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem("printxo_customer_orders") || "[]");
      if (savedOrders.length > 0) {
        setOrders(savedOrders);
      } else {
        // Sample order for demo
        setOrders([
          {
            orderNumber: "PXO-2026-9812",
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: "IN_PRODUCTION",
            totalAmount: 1899,
            items: [
              {
                product: INITIAL_PRODUCTS[0],
                quantity: 1,
                selectedColor: "Crimson Red",
              },
            ],
            shippingAddress: {
              fullName: "Vikram Sharma",
              street: "402 Maker Enclave, 12th Main",
              city: "Bengaluru",
              state: "Karnataka",
              postalCode: "560038",
            },
          },
        ]);
      }

      // Fetch live shipment tracking from BOS bridge
      fetch("/api/sync/shipment")
        .then((r) => r.json())
        .then((data) => {
          if (data.shipments) setShipments(data.shipments);
        })
        .catch(() => {});

      const savedRequests = JSON.parse(localStorage.getItem("printxo_custom_requests") || "[]");
      if (savedRequests.length > 0) {
        setCustomRequests([...savedRequests, ...SAMPLE_CUSTOM_REQUESTS]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const wishlistedProducts = INITIAL_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Profile Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 border border-red-400/40 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-red-950">
            VS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Vikram Sharma</h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-950 text-red-400 border border-red-800/40">
                Verified Maker
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">vikram.s@example.com • Bengaluru, India</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/custom-print"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider glow-crimson flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>New 3D Request</span>
          </Link>
          <Link
            href="/products"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-red-500" />
            <span>Shop Catalog</span>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "orders"
              ? "border-red-500 text-white bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4 text-red-500" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("quotes")}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "quotes"
              ? "border-red-500 text-white bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-red-500" />
          <span>Custom 3D Quotes ({customRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "wishlist"
              ? "border-red-500 text-white bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4 text-red-500" />
          <span>Saved Wishlist ({wishlistedProducts.length})</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center space-y-3">
              <Package className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No orders placed yet</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Explore our ready-made 3D printed catalog or upload your custom CAD files.
              </p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider"
              >
                Shop Catalog
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const liveShipment = shipments[order.orderNumber];
              const isShipped = liveShipment?.status === "SHIPPED" || liveShipment?.status === "IN_TRANSIT" || liveShipment?.status === "DELIVERED";
              const isDelivered = liveShipment?.status === "DELIVERED";

              return (
              <div
                key={order.orderNumber}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        {order.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/40">
                        {liveShipment?.status || order.status}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      Ordered on {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-white">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <Link
                      href={`/api/invoice/${order.orderNumber}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-red-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="View Gemini AI Tax Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Gemini Invoice</span>
                    </Link>
                  </div>
                </div>

                {/* Live Shipping & Dispatch Notification from BOS */}
                {liveShipment && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/30 via-zinc-900 to-zinc-900 border border-red-500/30 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-white">
                          Dispatched via {liveShipment.carrier || "Delhivery Express"}
                        </span>
                        {liveShipment.trackingNumber && (
                          <span className="font-mono text-xs text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                            AWB: {liveShipment.trackingNumber}
                          </span>
                        )}
                      </div>
                      {liveShipment.trackingUrl && (
                        <a
                          href={liveShipment.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <span>Track Consignment</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {liveShipment.notes && (
                      <p className="text-[11px] text-zinc-400">
                        Dispatch Note: {liveShipment.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Items in order */}
                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                          <Image
                            src={item.product?.images?.[0]?.url || "/logo-icon.svg"}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.product?.name}</p>
                          <p className="text-zinc-500 text-[11px]">
                            Qty: {item.quantity} • {item.selectedColor || item.product?.material}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-zinc-300">
                        {formatCurrency((item.product?.salePrice ?? item.product?.price ?? 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking Stepper */}
                <div className="pt-4 border-t border-zinc-800/80">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
                    <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                      ✓ Paid & Confirmed
                    </div>
                    <div className={`p-2 rounded-lg ${!isShipped ? "bg-red-950/40 text-red-400 border border-red-500/30" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"}`}>
                      {isShipped ? "✓ Printed & QC Passed" : "Slicing & Printing"}
                    </div>
                    <div className={`p-2 rounded-lg ${isShipped ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30" : "bg-zinc-950 text-zinc-500 border border-zinc-800"}`}>
                      {isShipped ? "✓ Optical Caliper QC" : "Quality Testing"}
                    </div>
                    <div className={`p-2 rounded-lg ${isDelivered ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30" : isShipped ? "bg-red-950/40 text-red-400 border border-red-500/30" : "bg-zinc-950 text-zinc-500 border border-zinc-800"}`}>
                      {isDelivered ? "✓ Delivered" : isShipped ? "In Transit / Dispatched" : "Express Dispatched"}
                    </div>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>
      )}

      {/* 2. CUSTOM 3D QUOTES TAB */}
      {activeTab === "quotes" && (
        <div className="space-y-6">
          {customRequests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-white">{req.projectTitle}</h3>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/40">
                      {req.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">
                    Ref: {req.requestNumber} • Created {formatDate(req.createdAt)}
                  </div>
                </div>

                {req.quote && (
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Quoted Manufacturing Total:</span>
                    <span className="text-xl font-black text-red-400">
                      {formatCurrency(req.quote.totalAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Requirements & Files */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Specs</span>
                  <p className="text-zinc-200">{req.preferredMaterial} ({req.finish || "Standard"})</p>
                  <p className="text-zinc-400">Color: {req.preferredColor || "Default"} • Qty: {req.quantity}</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Attached CAD Files</span>
                  <div className="space-y-1">
                    {req.files?.map((f: any, i: number) => (
                      <p key={i} className="text-zinc-200 truncate flex items-center gap-1">
                        <Layers className="w-3 h-3 text-red-500 shrink-0" />
                        <span>{f.filename}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Production Lead Time</span>
                  <p className="text-white font-semibold">
                    {req.quote?.productionTimeDays || 3} Business Days
                  </p>
                  <p className="text-zinc-500 text-[11px]">Optical Caliper QC Included</p>
                </div>
              </div>

              {/* Admin Quote Note & Accept Action */}
              {req.quote && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-red-950/40 border border-red-500/30 space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white block">Studio Engineering Slicing Note:</span>
                      <p className="text-xs text-zinc-300 mt-1">{req.quote.adminMessage}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-800/80">
                    <span className="text-xs text-zinc-400">
                      Quote valid until: <strong className="text-zinc-200">{formatDate(req.quote.validUntil)}</strong>
                    </span>

                    <Link
                      href={`/checkout?quoteId=${req.quote.id}&amount=${req.quote.totalAmount}`}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider glow-crimson text-center"
                    >
                      Accept Quote & Begin Production
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. WISHLIST TAB */}
      {activeTab === "wishlist" && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center space-y-3">
              <Heart className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Your wishlist is empty</h3>
              <p className="text-xs text-zinc-400">Save designs you love to inspect or purchase later.</p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950">
                    <Image
                      src={p.images[0]?.url || "/logo-icon.svg"}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(p.salePrice ?? p.price)}
                    </span>
                    <button
                      onClick={() => addItem(p, 1)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
