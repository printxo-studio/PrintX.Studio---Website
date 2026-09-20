"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Layers,
  ShieldCheck,
  Zap,
  Cpu,
  UploadCloud,
  CheckCircle2,
  Star,
  Flame,
  Truck,
  Box,
} from "lucide-react";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/mock-data";
import ProductCard from "@/components/products/ProductCard";
import ModelViewer from "@/components/3d/ModelViewer";

export default function HomePage() {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  const featuredProducts = INITIAL_PRODUCTS.filter((p) => p.isFeatured);
  const filteredProducts =
    activeCategoryFilter === "all"
      ? featuredProducts
      : INITIAL_PRODUCTS.filter((p) => p.categoryId === activeCategoryFilter);

  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-16 bg-grid-pattern">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-zinc-800/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-red-500/30 text-xs font-semibold text-zinc-300 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span>Next-Gen Additive Manufacturing Studio</span>
                <span className="text-zinc-600">•</span>
                <span className="text-red-400">0.08mm Layer Accuracy</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.08]">
                Turn Digital CAD Into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-rose-200">
                  Precision Physical
                </span>{" "}
                Reality.
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                PrintX Studio crafts gallery-grade functional decor, mechanical engineering prototypes, and high-detail figurines. Upload your 3D files for an instant quote or shop our bespoke ready-made catalog.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/custom-print"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide uppercase transition-all shadow-xl shadow-red-950/50 glow-crimson flex items-center justify-center gap-2 group"
                >
                  <UploadCloud className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                  <span>Request Custom Print</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-700/80 transition-all flex items-center justify-center gap-2"
                >
                  <span>Shop Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Micro-Metrics */}
              <div className="pt-6 border-t border-zinc-900 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-white">0.08<span className="text-red-500 text-sm">mm</span></div>
                  <div className="text-[11px] text-zinc-500 font-medium">Layer Resolution</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">24<span className="text-red-500 text-sm">h</span></div>
                  <div className="text-[11px] text-zinc-500 font-medium">Standard Dispatch</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">15<span className="text-red-500 text-sm">+</span></div>
                  <div className="text-[11px] text-zinc-500 font-medium">Industrial Polymers</div>
                </div>
              </div>
            </div>

            {/* Right Side: Interactive 3D Canvas Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md w-full">
                {/* Decorative border frame */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-red-600/40 via-zinc-700/30 to-red-600/40 opacity-75 blur-md -z-10" />
                <ModelViewer
                  title="Interactive Studio Model Inspector"
                  dimensions={{ x: 140, y: 140, z: 165 }}
                  defaultColor="#E50914"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1.5 block">
              Additive Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Curated Maker Collections
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-sm font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {INITIAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900 border border-zinc-800/80 hover:border-red-500/60 transition-all duration-300 flex flex-col justify-end p-5"
            >
              <Image
                src={cat.image || "/logo-icon.svg"}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
              
              <div className="relative z-10">
                <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider block mb-1">
                  {cat.productCount ?? 3} Designs
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS & FILTER TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1.5 block">
              Flagship Creations
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Featured 3D Prints
            </h2>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategoryFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategoryFilter === "all"
                  ? "bg-red-600 text-white shadow-md shadow-red-950"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              All Featured
            </button>
            {INITIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategoryFilter === cat.id
                    ? "bg-red-600 text-white shadow-md shadow-red-950"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. HOW CUSTOM 3D PRINTING WORKS */}
      <section id="how-it-works" className="relative bg-zinc-900/40 border-y border-zinc-800/80 py-20 bg-dots-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              Zero Guesswork Quoting
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              How Custom 3D Printing Works
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              From raw 3D mesh to doorstep delivery. We inspect tolerances, optimize layer orientation, and execute industrial manufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 relative group hover:border-red-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Upload CAD File</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drag-and-drop your STL, OBJ, 3MF, or STEP file. Our browser viewer instantly renders the 3D geometry and estimates volume.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 relative group hover:border-red-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">Slicing & Quote</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose material (PLA, PETG, Resin, Carbon Fiber), infill density, and color. Receive a transparent price quote within 2 hours.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 relative group hover:border-red-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Additive Production</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Once approved, models are queued on high-speed Bambu Lab and 8K resin printers with real-time progress updates in your dashboard.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 relative group hover:border-red-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-lg mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-white mb-2">Optical QC & Dispatch</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every print is post-processed, cleaned, measured with digital calipers, cushioned in eco-packaging, and shipped express.
              </p>
            </div>
          </div>

          {/* CTA Banner inside How it Works */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-red-950/60 via-zinc-900 to-red-950/60 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Have a 3D model ready right now?</h3>
              <p className="text-xs text-zinc-300 mt-1">Upload files up to 50MB. We review mesh watertightness for free.</p>
            </div>
            <Link
              href="/custom-print"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 glow-crimson"
            >
              Start Custom Upload
            </Link>
          </div>
        </div>
      </section>

      {/* 5. MATERIALS GUIDE */}
      <section id="materials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">
            Engineered Filaments & Resins
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Materials Engineered for Every Application
          </h2>
          <p className="text-zinc-400 text-sm">
            We stock only prime, humidity-controlled polymers and resins for flawless layer adhesion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">PLA+ High Precision</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40">Popular</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Biopolymer with superior stiffness and razor-sharp overhangs. Ideal for architectural models, display figurines, and aesthetic desk organizers.
            </p>
            <div className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-zinc-800">
              <div className="flex justify-between"><span>Heat Deflection:</span><strong>55°C</strong></div>
              <div className="flex justify-between"><span>Layer Detail:</span><strong>0.08 - 0.20 mm</strong></div>
              <div className="flex justify-between"><span>Finish:</span><strong>Smooth Matte / Satin</strong></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">PETG Industrial Pro</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">Durable</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              High impact resistance, weather-proof, and chemical resilience. Perfect for drone brackets, robotics enclosures, and outdoor fixtures.
            </p>
            <div className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-zinc-800">
              <div className="flex justify-between"><span>Heat Deflection:</span><strong>75°C</strong></div>
              <div className="flex justify-between"><span>Layer Detail:</span><strong>0.12 - 0.24 mm</strong></div>
              <div className="flex justify-between"><span>Finish:</span><strong>Semi-Gloss / Translucent</strong></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">8K Monochrome Resin</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40">Micro-Detail</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Photopolymer cured under 8K UV projection for microscopic surface smoothness. Ideal for tabletop RPG figurines, jewelry masters, and medical models.
            </p>
            <div className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-zinc-800">
              <div className="flex justify-between"><span>Heat Deflection:</span><strong>60°C</strong></div>
              <div className="flex justify-between"><span>Layer Detail:</span><strong>0.025 - 0.05 mm</strong></div>
              <div className="flex justify-between"><span>Finish:</span><strong>Injection-Mold Smooth</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">
            Trusted by Creators
          </span>
          <h2 className="text-3xl font-black text-white">Studio Stories & Feedback</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              &quot;The Voronoi lamp is a work of art on my desk. Clean layer lines, no stringing whatsoever, and the red accent matches my studio aesthetics.&quot;
            </p>
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="text-xs font-bold text-white">Vikram S.</div>
              <div className="text-[11px] text-zinc-500">Lead UX Designer, Bangalore</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              &quot;Uploaded a complex mechanical split keyboard housing in Carbon-Fiber PLA. Tolerances were dead-on for the PCB and Kailh switches. Outstanding turnaround.&quot;
            </p>
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="text-xs font-bold text-white">Arjun M.</div>
              <div className="text-[11px] text-zinc-500">Robotics Engineer, Pune</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              &quot;The 8K resin miniature detail is staggering. The dragon scales are sharper than injected miniatures I paid double for abroad.&quot;
            </p>
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="text-xs font-bold text-white">Rohan K.</div>
              <div className="text-[11px] text-zinc-500">Tabletop Game Master, Mumbai</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
