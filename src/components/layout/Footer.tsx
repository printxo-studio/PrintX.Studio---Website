import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  ShieldCheck,
  Zap,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/80 pt-16 pb-12 text-zinc-400">
      {/* Studio Value Props Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 pb-12 border-b border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-500 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Industrial Grade Tolerances</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Precision additive printing calibrated down to 0.08mm layer heights for crisp mechanical fits.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-500 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Rapid Turnaround</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Standard in-stock orders ship in 24 hours. Custom print quotes dispatched within 2 hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Quality Guaranteed</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Every print undergoes an optical dimensional check and surface cleanup before packaging.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-500 shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Custom Engineering Support</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Direct CAD & slicing advisory for prototypes, functional parts, and production batches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative w-48 h-12">
                <Image
                  src="/logo.png"
                  alt="PrintX Studio"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              PrintX Studio is a premier additive manufacturing studio delivering bespoke 3D-printed creations, functional engineering components, and rapid on-demand prototyping.
            </p>
            <div className="space-y-2 text-xs text-zinc-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>PrintX Studio Labs, Tech Hub Sector 4, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>support@printx.studio</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products?category=desk-and-office" className="hover:text-white transition-colors">
                  Desk & Ergonomics
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-and-decor" className="hover:text-white transition-colors">
                  Home & Voronoi Decor
                </Link>
              </li>
              <li>
                <Link href="/products?category=gaming-and-cosplay" className="hover:text-white transition-colors">
                  Gaming & Controller Stands
                </Link>
              </li>
              <li>
                <Link href="/products?category=miniatures-and-art" className="hover:text-white transition-colors">
                  8K Resin Miniatures
                </Link>
              </li>
              <li>
                <Link href="/products?category=engineering-and-parts" className="hover:text-white transition-colors">
                  Engineering & Drone Parts
                </Link>
              </li>
            </ul>
          </div>

          {/* Custom Services */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Custom Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/custom-print" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Upload STL / OBJ / 3MF
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How Custom Print Works
                </Link>
              </li>
              <li>
                <Link href="/#materials" className="hover:text-white transition-colors">
                  Filaments & Resin Specs
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Track Custom Quotes
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Policies */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Account & Info
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Orders & Account
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} PrintX Studio. All rights reserved. Precision Additive Manufacturing.</p>
          <div className="flex items-center gap-4 text-zinc-300">
            <span>Stripe Secured</span>
            <span>•</span>
            <span>UPI / Cards Accepted</span>
            <span>•</span>
            <span className="text-red-400 font-medium">Made with Passion in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
