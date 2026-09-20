import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers } from "lucide-react";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/mock-data";

export const metadata = {
  title: "Product Categories",
  description: "Browse 3D printed collections by category at PrintX Studio.",
};

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
          <span>PrintX Studio</span>
          <span>•</span>
          <span>Directory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          3D Printing Categories
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xl">
          Discover specialized 3D designs engineered for desk setups, living spaces, gaming rigs, and industrial machinery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {INITIAL_CATEGORIES.map((cat) => {
          const count = INITIAL_PRODUCTS.filter((p) => p.categoryId === cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-red-500/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                <Image
                  src={cat.image || "/logo-icon.svg"}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-950/80 text-red-400 border border-red-500/30 backdrop-blur-md flex items-center gap-1.5">
                  <Layers className="w-3 h-3" />
                  {count} {count === 1 ? "Product" : "Products"}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-white">
                  <span>Explore Designs</span>
                  <ArrowRight className="w-4 h-4 text-red-500 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
