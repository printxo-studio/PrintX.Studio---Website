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
  ExternalLink,
  Sparkles,
  ShoppingBag,
  FileText,
  Truck,
  LogOut,
  MapPin,
  Phone,
  Building,
  Mail,
  Edit3,
  Check,
  AlertCircle,
} from "lucide-react";
import { SAMPLE_CUSTOM_REQUESTS, INITIAL_PRODUCTS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useWishlist, useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import OrderTrackingPipeline from "@/components/orders/OrderTrackingPipeline";

export default function AccountDashboardPage() {
  const { customer, isLoading, logout, updateProfile, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "quotes" | "profile" | "wishlist">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [customRequests, setCustomRequests] = useState<any[]>(SAMPLE_CUSTOM_REQUESTS);
  const { wishlistIds } = useWishlist();
  const { addItem } = useCart();

  // Profile Edit Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Sync profile form when customer changes
  useEffect(() => {
    if (customer) {
      setProfileForm({
        name: customer.name || "",
        phone: customer.phone || "",
        company: customer.company || "",
        address: customer.address || "",
        city: customer.city || "Bengaluru",
        state: customer.state || "Karnataka",
        pincode: customer.pincode || "560001",
      });
    }
  }, [customer]);

  // Fetch real customer orders
  const fetchOrders = async () => {
    if (!customer) return;
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/account/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.error("Failed to fetch customer orders", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchOrders();
    }
  }, [customer]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    const res = await updateProfile(profileForm);
    setProfileSaving(false);
    if (res.success) {
      setProfileSuccess("✓ Profile and shipping details updated successfully!");
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(null), 4000);
    } else {
      setProfileError(res.error || "Failed to update profile");
    }
  };

  const wishlistedProducts = INITIAL_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  // If unauthenticated, show welcome login/register screen
  if (!isLoading && !customer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-red-700 to-red-500 border border-red-400/40 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-red-950">
          <User className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">Customer Account & Orders</h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Sign in to track live 3D printing orders, dispatch courier tracking, official tax invoices, and manage your delivery addresses.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => openAuthModal("login")}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider glow-crimson transition-all"
          >
            Sign In to Your Account
          </button>
          <button
            onClick={() => openAuthModal("register")}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Create New Account
          </button>
        </div>
      </div>
    );
  }

  const initials = customer?.name
    ? customer.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "VS";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Profile Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 border border-red-400/40 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-red-950">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{customer?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-950 text-red-400 border border-red-800/40">
                {customer?.customerCode || "Verified Maker"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {customer?.email} • {customer?.city || "India"}
            </p>
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
          <button
            onClick={() => logout()}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-zinc-400" />
            <span>Sign Out</span>
          </button>
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
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-red-500 text-white bg-zinc-900/50"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <User className="w-4 h-4 text-red-500" />
          <span>Profile & Addresses</span>
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

      {/* TAB 1: ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              Loading verified orders from PrintX Studio database...
            </div>
          ) : orders.length === 0 ? (
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
              const liveShipment = order.shipments?.[0];
              const isShipped =
                order.shippingStatus === "SHIPPED" ||
                order.shippingStatus === "IN_TRANSIT" ||
                order.shippingStatus === "DELIVERED" ||
                liveShipment?.status === "SHIPPED" ||
                liveShipment?.status === "IN_TRANSIT" ||
                liveShipment?.status === "DELIVERED";
              const isDelivered =
                order.shippingStatus === "DELIVERED" || liveShipment?.status === "DELIVERED";

              return (
                <div
                  key={order.id || order.orderNumber}
                  className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-6 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          {order.orderNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/40">
                          {liveShipment?.status || order.shippingStatus || order.overallStatus}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        Ordered on {formatDate(order.orderDate || order.createdAt)}
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
                        title="View Official Tax Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Tax Invoice</span>
                      </Link>
                    </div>
                  </div>

                  {/* Live Shipping & Dispatch Notification */}
                  {liveShipment && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/30 via-zinc-900 to-zinc-900 border border-red-500/30 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-red-400" />
                          <span className="text-xs font-bold text-white">
                            Dispatched via {liveShipment.courierName || "Delhivery Express"}
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
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                            <Image
                              src={
                                item.product?.imageUrl ||
                                item.product?.images?.[0]?.url ||
                                "/logo-icon.svg"
                              }
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-zinc-500 text-[11px]">
                              Qty: {item.quantity} • {item.description || item.sku || "Standard"}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-zinc-300">
                          {formatCurrency((item.unitPrice || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Order Pipeline with Moving Truck & Logistics Flowchart */}
                  <OrderTrackingPipeline order={order} shipment={liveShipment} />
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PROFILE & ADDRESSES */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {profileSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center gap-2 text-xs text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Account & Delivery Coordinates</h3>
                <p className="text-xs text-zinc-400">
                  Changes made here update your PrintX BOS customer profile across our manufacturing studio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-red-400" />
                <span>{isEditingProfile ? "Cancel" : "Edit Details"}</span>
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      value={profileForm.company}
                      onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                      placeholder="e.g. Maker Lab Inc."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={customer?.email}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase">
                    Default Shipping Street Address
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Street, Building, Unit Number"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="City"
                      className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      placeholder="State"
                      className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={profileForm.pincode}
                      onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                      placeholder="PIN Code"
                      className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider glow-crimson disabled:opacity-50"
                  >
                    {profileSaving ? "Saving..." : "Save Coordinates"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
                    Contact & Identification
                  </span>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-zinc-300">
                      <User className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-white font-semibold">{customer?.name}</span>
                    </p>
                    <p className="flex items-center gap-2 text-zinc-300">
                      <Mail className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{customer?.email}</span>
                    </p>
                    <p className="flex items-center gap-2 text-zinc-300">
                      <Phone className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{customer?.phone || "No phone registered"}</span>
                    </p>
                    {customer?.company && (
                      <p className="flex items-center gap-2 text-zinc-300">
                        <Building className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{customer?.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
                    Primary Shipping Address
                  </span>
                  <div className="space-y-1.5 text-zinc-300">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>
                        {customer?.address || "No street address saved yet"}
                        <br />
                        {customer?.city || "Bengaluru"}, {customer?.state || "Karnataka"}{" "}
                        {customer?.pincode ? `- ${customer?.pincode}` : ""}
                        <br />
                        India
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM QUOTES */}
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
                  <p className="text-zinc-200">
                    {req.preferredMaterial} ({req.finish || "Standard"})
                  </p>
                  <p className="text-zinc-400">
                    Color: {req.preferredColor || "Default"} • Qty: {req.quantity}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">
                    Attached CAD Files
                  </span>
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
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">
                    Production Lead Time
                  </span>
                  <p className="text-white font-semibold">
                    {req.quote?.productionTimeDays || 3} Business Days
                  </p>
                  <p className="text-zinc-500 text-[11px]">Optical Caliper QC Included</p>
                </div>
              </div>

              {req.quote && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-red-950/40 border border-red-500/30 space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Studio Engineering Slicing Note:
                      </span>
                      <p className="text-xs text-zinc-300 mt-1">{req.quote.adminMessage}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-800/80">
                    <span className="text-xs text-zinc-400">
                      Quote valid until:{" "}
                      <strong className="text-zinc-200">{formatDate(req.quote.validUntil)}</strong>
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

      {/* TAB 4: WISHLIST */}
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
                      src={p.images?.[0]?.url || (p as any).imageUrl || "/logo-icon.svg"}
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
