"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  User as UserIcon,
  Layers,
  Sparkles,
  Search,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import CartDrawer from "../cart/CartDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { customer, openAuthModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navLinks = [
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/categories" },
    {
      name: "Custom 3D Print",
      href: "/custom-print",
      highlight: true,
      badge: "Instant Quote",
    },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Materials Guide", href: "/#materials" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav border-b border-zinc-800/80">
        {/* Top studio announcement bar */}
        <div className="bg-gradient-to-r from-red-950/60 via-zinc-900 to-red-950/60 border-b border-red-500/20 py-1.5 px-4 text-xs text-center text-zinc-300 flex items-center justify-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-medium text-white">Precision Additive Manufacturing:</span>
          <span className="hidden sm:inline">Free express shipping on all orders over ₹1,499</span>
          <span className="text-red-400 font-semibold">• 0.08mm Ultra-Layer Quality</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-40 sm:w-48 h-12 transition-transform group-hover:scale-[1.02]">
              <Image
                src="/logo.png"
                alt="PrintX Studio"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    link.highlight
                      ? "text-red-400 hover:text-red-300 bg-red-950/30 border border-red-500/30 hover:border-red-500/60 glow-crimson-subtle"
                      : isActive
                      ? "text-white bg-zinc-800/60 border border-zinc-700/50"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  {link.highlight && <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                  {link.name}
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-600 text-white leading-none">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick custom print CTA button on desktop */}
            <Link
              href="/custom-print"
              className="hidden md:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg hover:shadow-red-600/30 glow-crimson-subtle"
            >
              <Layers className="w-4 h-4" />
              Upload 3D File
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/account"
              className="relative p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              title="Shopping Cart"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Customer Account & Orders Portal */}
            {customer ? (
              <Link
                href="/account"
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-2"
                title={`${customer.name} - Account & Orders`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-700 to-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm shadow-red-950">
                  {customer.name
                    ? customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "VS"}
                </div>
                <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate text-white">
                  {customer.name.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 lg:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[110px] bottom-0 bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto animate-fadeIn z-50">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold px-2 mb-2">
                Navigation
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    link.highlight
                      ? "bg-red-950/40 text-red-400 border border-red-500/30"
                      : "text-zinc-200 hover:bg-zinc-900 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.highlight && <Sparkles className="w-4 h-4 text-red-500" />}
                    {link.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </Link>
              ))}

              <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800/60"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-red-500" />
                    Customer Account & Orders
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <Link
                href="/custom-print"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center justify-center gap-2 glow-crimson"
              >
                <Layers className="w-5 h-5" />
                Request Custom 3D Print
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Persistent slide-out cart drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
