"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Star,
  Package,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fff8f3]">
      {/* Decorative Background Shapes */}
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#f4b6a6]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#4a1d3f]/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f4b6a6] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e76f51] shadow-sm">
            <Sparkles size={15} />
            ZestBag Shopping
          </div>

          <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] text-[#4a1d3f] md:text-6xl lg:text-7xl">
            Everything You Need,
            <span className="mt-2 block text-[#e76f51]">
              All in One Place
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-[#5f5059] sm:text-lg">
            Discover great products across fashion, electronics, bags,
            accessories and more. Shop your favourites and enjoy a seamless
            shopping experience.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#4a1d3f] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4a1d3f]/20 transition hover:bg-[#e76f51]"
            >
              Shop Now
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-[#4a1d3f]/20 bg-white px-7 py-4 text-sm font-semibold text-[#4a1d3f] transition hover:border-[#e76f51] hover:text-[#e76f51]"
            >
              Explore Products
            </Link>
          </div>

          {/* Small Highlights */}
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-[#5f5059]">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4b6a6]/40 text-[#4a1d3f]">
                <Package size={18} />
              </span>
              Quality Products
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4b6a6]/40 text-[#4a1d3f]">
                <Star size={18} />
              </span>
              Great Deals
            </div>
          </div>
        </motion.div>

        {/* Right Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative"
        >
          <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-[2.5rem] bg-[#e76f51] p-8 shadow-2xl shadow-[#e76f51]/20 sm:min-h-[470px]">
            {/* Decorative Circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[45px] border-white/10" />

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-5 top-6 rounded-2xl bg-white px-4 py-3 text-[#4a1d3f] shadow-xl sm:right-8 sm:top-8"
            >
              <p className="text-xs font-medium text-[#8b747f]">
                Shopping made easy
              </p>
              <p className="mt-1 text-sm font-bold">Find your favourites</p>
            </motion.div>

            {/* Main Shopping Icon */}
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 flex h-52 w-52 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-64 sm:w-64"
            >
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-2xl sm:h-48 sm:w-48">
                <ShoppingBag
                  size={105}
                  strokeWidth={1.4}
                  className="text-[#4a1d3f] sm:h-[125px] sm:w-[125px]"
                />
              </div>
            </motion.div>

            {/* Bottom Text */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-white">
              <p className="text-2xl font-bold sm:text-3xl">
                Great Deals.
              </p>
              <p className="mt-1 text-2xl font-bold text-[#4a1d3f] sm:text-3xl">
                Great Products.
              </p>
            </div>

            {/* Floating Mini Cards */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-24 left-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#4a1d3f] shadow-lg sm:left-8"
            >
              New Arrivals
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-4 top-28 rounded-xl bg-[#4a1d3f] px-3 py-2 text-xs font-semibold text-white shadow-lg sm:right-8"
            >
              Best Sellers
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}