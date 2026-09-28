"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Icon from "@mdi/react";
import {
  mdiCartOutline,
  mdiStar,
  mdiPackageVariant,
} from "@mdi/js";

import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const productName =
    product.name?.trim() ||
    product.title?.trim() ||
    "Untitled Product";

  const productImage =
    product.images?.[0]?.url ||
    "/placeholder-product.png";

  const price =
    typeof product.price === "number"
      ? product.price
      : Number(product.price) || 0;

  const rating =
    typeof product.rating === "number"
      ? product.rating
      : Number(product.rating) || 0;

  const stock =
    typeof product.stock === "number"
      ? product.stock
      : Number(product.stock) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="group h-full"
    >
      <Link
        href={`/products/${product._id}`}
        className="block h-full"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#f0ded5] bg-white shadow-[0_15px_45px_rgba(87,33,63,0.07)] transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(87,33,63,0.14)]">
          
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-[#fffaf5]">
            {productImage ? (
              <Image
                src={productImage}
                alt={productName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Icon
                  path={mdiPackageVariant}
                  size={2.5}
                  className="text-[#c87965]"
                />
              </div>
            )}

            {/* Category */}
            {product.category && (
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#57213f] shadow-sm backdrop-blur-sm">
                {product.category}
              </div>
            )}

            {/* Out of stock */}
            {stock <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-1 flex-col p-5">
            
            <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-black text-[#57213f] transition-colors group-hover:text-[#c87965]">
              {productName}
            </h3>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-1">
              <Icon
                path={mdiStar}
                size={0.75}
                className="text-[#e8a23a]"
              />

              <span className="text-sm font-semibold text-[#805f68]">
                {rating > 0 ? rating.toFixed(1) : "No rating"}
              </span>
            </div>

            {/* Price + Cart */}
            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
              <div>
                <p className="text-2xl font-black text-[#57213f]">
                  ₹{price.toLocaleString("en-IN")}
                </p>

                {stock > 0 && (
                  <p className="mt-1 text-xs text-[#805f68]">
                    {stock} {stock === 1 ? "item" : "items"} available
                  </p>
                )}
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#57213f] text-white transition-all duration-300 group-hover:bg-[#c87965] group-hover:scale-105">
                <Icon
                  path={mdiCartOutline}
                  size={0.9}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}