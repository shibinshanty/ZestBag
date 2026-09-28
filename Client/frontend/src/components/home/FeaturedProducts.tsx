"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Icon from "@mdi/react";
import Image from "next/image";

import {
  mdiArrowRight,
  mdiPackageVariant,
  mdiAutoFix,
  mdiAlertCircleOutline,
  mdiShopping,
  mdiStarFourPoints,
} from "@mdi/js";

import ProductCard from "../product/ProductCard";
import { getProducts } from "../../services/product.service";
import type { Product } from "../../types/product";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        // Show only the first 4 products as featured products
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Unable to load featured products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#fff8f3] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#f6b6a8]/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#4a1d3f]/10 blur-3xl" />

      <div className="pointer-events-none absolute right-[12%] top-16 rotate-12 text-[#e76f51]/20">
        <Icon path={mdiStarFourPoints} size={2.2} />
      </div>

      <div className="pointer-events-none absolute bottom-20 left-[8%] -rotate-12 text-[#e76f51]/20">
        <Icon path={mdiAutoFix} size={1.8} />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            {/* Small Label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f6b6a8]/60 bg-[#f6b6a8]/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b84d38]"
            >
              <Icon path={mdiAutoFix} size={0.8} />
              Our Collection
            </motion.div>

            {/* Main Heading */}
            <h2 className="text-4xl font-black leading-tight tracking-tight text-[#4a1d3f] sm:text-5xl">
              Find Something
              <span className="block text-[#e76f51]">You’ll Love</span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#5f5059] sm:text-lg">
              Discover our handpicked collection of popular products,
              carefully selected to bring style, comfort, and happiness to
              your everyday life.
            </p>

            {/* Product Count */}
            {!loading && !error && products.length > 0 && (
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4a1d3f]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4a1d3f] text-xs text-white">
                  {products.length}
                </span>

                Featured products available
              </div>
            )}
          </div>

          {/* Desktop View All Button */}
          <Link
            href="/products"
            className="group hidden items-center gap-3 rounded-full border border-[#4a1d3f]/15 bg-white px-6 py-3 text-sm font-bold text-[#4a1d3f] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-[#4a1d3f] hover:text-white hover:shadow-lg sm:inline-flex"
          >
            View All Products

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6b6a8] text-[#4a1d3f] transition-transform duration-300 group-hover:translate-x-1">
              <Icon path={mdiArrowRight} size={0.9} />
            </span>
          </Link>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item * 0.1 }}
                className="overflow-hidden rounded-3xl border border-[#ead9e2] bg-white p-4 shadow-sm"
              >
                <div className="h-64 animate-pulse rounded-2xl bg-[#f3e5e0]" />

                <div className="mt-5 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#f3e5e0]" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#f3e5e0]" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-[#f3e5e0]" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500">
              <Icon path={mdiAlertCircleOutline} size={1.6} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-red-700">
              Something went wrong
            </h3>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#ead9e2] bg-white px-6 py-16 text-center shadow-sm"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f6b6a8]/25 text-[#e76f51]">
              <Icon path={mdiPackageVariant} size={2.2} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-[#4a1d3f]">
              No featured products yet
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5f5059]">
              We are preparing something special for you. Please check back
              soon for our latest products.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4a1d3f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e76f51]"
            >
              Explore Products
              <Icon path={mdiArrowRight} size={0.9} />
            </Link>
          </motion.div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.12,
                }}
                whileHover={{ y: -8 }}
                className="group relative h-full"
              >
                {/* Featured Badge */}
                <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[#4a1d3f] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
                  <Icon path={mdiAutoFix} size={0.65} />
                  Featured
                </div>

                {/* Card Glow */}
                <div className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#f6b6a8]/40 via-transparent to-[#4a1d3f]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative h-full overflow-hidden rounded-3xl border border-[#ead9e2] bg-white p-2 shadow-sm transition-all duration-300 group-hover:border-[#f6b6a8] group-hover:shadow-xl">
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 rounded-full bg-[#4a1d3f] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#e76f51]"
          >
            <Icon path={mdiShopping} size={0.9} />

            View All Products

            <Icon
              path={mdiArrowRight}
              size={0.9}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}