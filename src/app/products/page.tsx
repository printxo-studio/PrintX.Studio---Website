"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Layers,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/mock-data";
import ProductCard from "@/components/products/ProductCard";

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [priceMax, setPriceMax] = useState<number>(3500);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [publishedProducts, setPublishedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setPublishedProducts(data.products);
        }
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  const combinedProducts = useMemo(() => {
    if (publishedProducts.length > 0) {
      return publishedProducts;
    }
    return INITIAL_PRODUCTS;
  }, [publishedProducts]);

  // Extract unique materials
  const allMaterials = useMemo(() => {
    const set = new Set<string>();
    combinedProducts.forEach((p) => {
      const simplified = (p.material || "PLA").split(" ")[0]; // e.g. PETG, PLA+, Carbon, Resin
      set.add(simplified);
    });
    return Array.from(set);
  }, [combinedProducts]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return combinedProducts.filter((product) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.shortDescription.toLowerCase().includes(query);
        const matchesMaterial = product.material.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesMaterial) return false;
      }

      // Category
      if (selectedCategory !== "all") {
        const cat = INITIAL_CATEGORIES.find((c) => c.slug === selectedCategory);
        if (cat && product.categoryId !== cat.id) return false;
        if (!cat && product.categoryId !== selectedCategory) return false;
      }

      // Material
      if (selectedMaterial !== "all") {
        if (!product.material.toLowerCase().includes(selectedMaterial.toLowerCase())) {
          return false;
        }
      }

      // In stock
      if (inStockOnly && product.stockQuantity <= 0) {
        return false;
      }

      // Price
      const effectivePrice = product.salePrice ?? product.price;
      if (effectivePrice > priceMax) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice ?? a.price;
      const priceB = b.salePrice ?? b.price;

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [searchQuery, selectedCategory, selectedMaterial, inStockOnly, sortBy, priceMax]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMaterial("all");
    setInStockOnly(false);
    setSortBy("featured");
    setPriceMax(3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
          <span>PrintX Studio</span>
          <span>•</span>
          <span>Storefront</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Precision 3D Printed Catalog
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xl">
          Explore ready-to-ship maker accessories, Voronoi architectural decor, and ultra-dense functional components.
        </p>
      </div>

      {/* Search & Mobile Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, filament material, or keywords..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sorting */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300"
          >
            <Filter className="w-4 h-4 text-red-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <SlidersHorizontal className="w-4 h-4 text-red-500" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Categories
            </h4>
            <div className="space-y-1.5 text-sm">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  selectedCategory === "all"
                    ? "bg-red-950/60 text-red-400 font-semibold border border-red-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <span>All Categories</span>
                <span>{INITIAL_PRODUCTS.length}</span>
              </button>
              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? "bg-red-950/60 text-red-400 font-semibold border border-red-500/30"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-zinc-500 text-[10px]">
                    {INITIAL_PRODUCTS.filter((p) => p.categoryId === cat.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Material */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Material Family
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedMaterial("all")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  selectedMaterial === "all"
                    ? "bg-red-600 text-white border-red-500"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                All
              </button>
              {allMaterials.map((mat) => (
                <button
                  key={mat}
                  onClick={() => setSelectedMaterial(mat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                    selectedMaterial === mat
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Max Price</span>
              <span className="text-white font-mono">₹{priceMax}</span>
            </div>
            <input
              type="range"
              min={400}
              max={3500}
              step={50}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-red-600 bg-zinc-800 cursor-pointer"
            />
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-zinc-800">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 accent-red-600 text-red-600"
              />
              <span>In-Stock Ready to Ship Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active filters status bar */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div>
              Showing <strong className="text-white">{filteredProducts.length}</strong> products
            </div>
            {(selectedCategory !== "all" || selectedMaterial !== "all" || inStockOnly || searchQuery) && (
              <button
                onClick={resetFilters}
                className="text-red-400 hover:underline font-medium"
              >
                Clear all active filters
              </button>
            )}
          </div>

          {/* Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Try adjusting your search query, material filter, or max price to view other available prints.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-zinc-950 p-6 flex flex-col justify-between shadow-2xl border-l border-zinc-800">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white">Filter Products</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-zinc-400">Category</div>
                {INITIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setIsMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                      selectedCategory === cat.slug
                        ? "bg-red-600 text-white"
                        : "bg-zinc-900 text-zinc-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-xs uppercase"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductCatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-zinc-400">Loading catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
