"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Check,
  Star,
  Zap,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCart, useWishlist } from "@/lib/store";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.colorOptions[0]);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-red-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-xl hover:shadow-red-950/20">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.images[0]?.url || "/logo-icon.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-red-600 text-white flex items-center gap-1 shadow-md">
              <Zap className="w-2.5 h-2.5" /> Featured
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900/90 text-red-400 border border-red-500/30 backdrop-blur-md">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button Top Right */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition-all ${
            wishlisted
              ? "bg-red-600 text-white"
              : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Material overlay tag */}
        <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-[10px] text-zinc-300 flex items-center gap-1">
          <Layers className="w-2.5 h-2.5 text-red-400" />
          <span>{product.material}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-amber-400 mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-zinc-200">
              {product.rating ?? 4.9}
            </span>
            <span className="text-zinc-500 text-[11px]">
              ({product.reviewsCount ?? 20})
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-red-400 transition-colors">
            <h3 className="font-semibold text-sm text-white line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-white">
                {formatCurrency(product.salePrice ?? product.price)}
              </span>
              {product.salePrice && (
                <span className="text-xs text-zinc-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              {product.stockQuantity > 0 ? (
                product.stockQuantity <= product.lowStockThreshold ? (
                  <span className="text-amber-400">Only {product.stockQuantity} left</span>
                ) : (
                  "Ready to Ship"
                )
              ) : (
                <span className="text-red-400">Backorder (Made to order)</span>
              )}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isAdded}
            className={`p-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white"
            }`}
            title="Quick add to cart"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
