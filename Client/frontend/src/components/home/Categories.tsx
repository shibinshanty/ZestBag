"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Smartphone,
  Shirt,
  ShoppingBag,
  Footprints,
  Sparkles,
  House,
  Watch,
  Trophy,
  ArrowUpRight,
} from "lucide-react";

const categories = [
  {
    name: "Electronics",
    icon: Smartphone,
    description: "Smart tech & gadgets",
  },
  {
    name: "Fashion",
    icon: Shirt,
    description: "Style for every day",
  },
  {
    name: "Bags",
    icon: ShoppingBag,
    description: "Carry your style",
  },
  {
    name: "Shoes",
    icon: Footprints,
    description: "Walk with confidence",
  },
  {
    name: "Beauty",
    icon: Sparkles,
    description: "Beauty essentials",
  },
  {
    name: "Home & Kitchen",
    icon: House,
    description: "Make life beautiful",
  },
  {
    name: "Accessories",
    icon: Watch,
    description: "Complete your look",
  },
  {
    name: "Sports",
    icon: Trophy,
    description: "For active lifestyles",
  },
];

export default function Categories() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#e76f51]">
              Explore Collection
            </p>

            <h2 className="text-3xl font-bold text-[#4a1d3f] sm:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-3 max-w-xl text-[#5f5059]">
              Explore products from different categories and discover
              something perfect for you.
            </p>
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#4a1d3f] transition hover:text-[#e76f51]"
          >
            View all products
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                }}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(
                    category.name
                  )}`}
                  className="group flex h-full flex-col items-center rounded-2xl border border-[#f0e4e8] bg-[#fff8f3] p-4 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#f4b6a6] hover:bg-[#fff1eb] hover:shadow-lg"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#4a1d3f] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#4a1d3f] group-hover:text-white">
                    <Icon size={29} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold leading-5 text-[#261923] transition-colors group-hover:text-[#e76f51]">
                    {category.name}
                  </h3>

                  <p className="mt-2 hidden text-xs leading-4 text-[#8b747f] xl:block">
                    {category.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}