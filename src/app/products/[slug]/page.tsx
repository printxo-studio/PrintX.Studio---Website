"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Check,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Layers,
  Clock,
  Box,
  ChevronRight,
  Share2,
  Sparkles,
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useCart, useWishlist } from "@/lib/store";
import ModelViewer from "@/components/3d/ModelViewer";
import ProductCard from "@/components/products/ProductCard";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const initialProduct = INITIAL_PRODUCTS.find((p) => p.slug === slug);
  const [product, setProduct] = useState<any>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);

  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colorOptions?.[0] || "Matte Black");
  const [quantity, setQuantity] = useState(1);
  const [personalizationNote, setPersonalizationNote] = useState("");
  const [activeTab, setActiveTab] = useState<"gallery" | "3d">("gallery");
  const [isAdded, setIsAdded] = useState(false);

  React.useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          if (data.product.colorOptions?.[0] && !selectedColor) {
            setSelectedColor(data.product.colorOptions[0]);
          }
        }
      })
      .catch((err) => console.error("Error fetching live product:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor, personalizationNote);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const wishlisted = isWishlisted(product.id);
  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.id !== product.id
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <Link href="/products" className="hover:text-white transition-colors">
          Products
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-zinc-200 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Media Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* View Mode Switcher: Gallery vs 3D Interactive Model */}
          <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800 w-fit">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "gallery"
                  ? "bg-red-600 text-white shadow-md shadow-red-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Photo Gallery
            </button>
            <button
              onClick={() => setActiveTab("3d")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "3d"
                  ? "bg-red-600 text-white shadow-md shadow-red-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Interactive 3D Inspector</span>
            </button>
          </div>

          {activeTab === "gallery" ? (
            <div className="space-y-4">
              {/* Main Image Display */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
                <Image
                  src={product.images[selectedImageIndex]?.url || "/logo-icon.svg"}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-bold bg-red-600 text-white shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {product.images.map((img: any, idx: number) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-950 border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? "border-red-500 scale-105"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ModelViewer
              title={`${product.name} (3D CAD Simulation)`}
              defaultColor="#E50914"
              dimensions={{ x: 130, y: 130, z: 150 }}
            />
          )}
        </div>

        {/* Right: Product Meta & Purchase Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/60 text-red-400 border border-red-800/40">
                SKU: {product.sku}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-semibold text-white">{product.rating}</span>
                <span className="text-zinc-500">({product.reviewsCount} customer reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-black text-white">
                {formatCurrency(product.salePrice ?? product.price)}
              </span>
              {product.salePrice && (
                <span className="text-base text-zinc-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="text-xs text-emerald-400 font-medium">
                Inclusive of all taxes
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">
            {product.fullDescription}
          </p>

          {/* Filament Color Selector */}
          {product.colorOptions.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Filament Color:</span>
                <span className="text-white normal-case font-medium">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colorOptions.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedColor === color
                        ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-950"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Personalization Note */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-zinc-400 flex items-center justify-between">
              <span>Custom Engraving / Notes (Optional):</span>
              <span className="text-[10px] text-zinc-500">Free studio tagging</span>
            </label>
            <input
              type="text"
              value={personalizationNote}
              onChange={(e) => setPersonalizationNote(e.target.value)}
              placeholder="e.g. 'Engrave Studio #04 on underside'"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity modifier */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-zinc-400 hover:text-white text-sm"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-zinc-400 hover:text-white text-sm"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white glow-crimson"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • {formatCurrency((product.salePrice ?? product.price) * quantity)}</span>
                  </>
                )}
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-colors ${
                  wishlisted
                    ? "bg-red-950/60 border-red-500 text-red-400"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
                aria-label="Save item"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-400" : ""}`} />
              </button>
            </div>

            {/* Quick custom quote alternative */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>Need this modified or printed in different dimensions?</span>
              </div>
              <Link
                href={`/custom-print?ref=${product.slug}`}
                className="text-red-400 hover:underline font-semibold"
              >
                Request Custom Variant
              </Link>
            </div>
          </div>

          {/* Technical Specs Table */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Manufacturing Specifications
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">Filament/Resin</span>
                <span className="font-semibold text-zinc-200">{product.material}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">Dimensions (W×D×H)</span>
                <span className="font-semibold text-zinc-200">{product.dimensions || "Custom"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">Production Time</span>
                <span className="font-semibold text-zinc-200">{product.productionTimeDays} Business Days</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">Stock Status</span>
                <span className="font-semibold text-emerald-400">
                  {product.stockQuantity > 0 ? `${product.stockQuantity} Ready to Ship` : "Printed on Order"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-zinc-900">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Related 3D Creations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
