"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  mdiAlertCircleOutline,
  mdiFilterVariant,
  mdiMagnify,
  mdiPackageVariant,
  mdiRefresh,
  mdiSort,
} from "@mdi/js";

import Icon from "@mdi/react";

import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/services/product.service";

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
  category?: string;
  rating?: number;
}

interface ProductsResponse {
  products?: Product[];
  data?: Product[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts();

      const typedResponse = response as Product[] | ProductsResponse;

      let productData: Product[] = [];

      if (Array.isArray(typedResponse)) {
        productData = typedResponse;
      } else if (Array.isArray(typedResponse.products)) {
        productData = typedResponse.products;
      } else if (Array.isArray(typedResponse.data)) {
        productData = typedResponse.data;
      }

      setProducts(productData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = products
      .map((product) => product.category)
      .filter((category): category is string => Boolean(category));

    return ["all", ...Array.from(new Set(uniqueCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      result = result.filter(
        (product) =>
          product.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (sort === "low-high") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "high-low") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, category, sort]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("default");
  };

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#c87965]">
            Explore Our Collection
          </p>

          <h1 className="text-4xl font-black text-[#57213f] sm:text-5xl">
            All Products
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#805f68] sm:text-base">
            Discover our complete collection of carefully selected products.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-3xl border border-[#f0ded5] bg-white p-5 shadow-[0_15px_45px_rgba(87,33,63,0.07)]"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
            {/* Search */}
            <div className="relative">
              <Icon
                path={mdiMagnify}
                size={0.9}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98991]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-[#ead6ce] bg-[#fffaf5] py-3 pl-12 pr-4 text-sm text-[#57213f] outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Icon
                path={mdiFilterVariant}
                size={0.85}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98991]"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#ead6ce] bg-[#fffaf5] px-11 py-3 text-sm text-[#57213f] outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All Categories" : item}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <Icon
                path={mdiSort}
                size={0.85}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98991]"
              />

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#ead6ce] bg-[#fffaf5] px-11 py-3 text-sm text-[#57213f] outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10"
              >
                <option value="default">Sort By</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Product Count and Reset */}
        {!loading && !error && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-[#805f68]">
              Showing{" "}
              <span className="font-bold text-[#57213f]">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>

            {(search || category !== "all" || sort !== "default") && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm font-bold text-[#c87965] transition hover:text-[#57213f]"
              >
                <Icon path={mdiRefresh} size={0.7} />
                Reset
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl bg-white p-4 shadow-sm"
              >
                <div className="h-64 rounded-2xl bg-[#f4e6df]" />
                <div className="mt-5 h-5 rounded bg-[#f4e6df]" />
                <div className="mt-3 h-4 w-1/2 rounded bg-[#f4e6df]" />
                <div className="mt-5 h-10 rounded-xl bg-[#f4e6df]" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <Icon
              path={mdiAlertCircleOutline}
              size={2.5}
              className="mx-auto mb-4 text-red-400"
            />

            <h2 className="text-xl font-bold text-[#57213f]">
              {error}
            </h2>

            <p className="mt-2 text-sm text-[#805f68]">
              Something went wrong while loading your products.
            </p>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-6 rounded-full bg-[#57213f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#713052]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-[#f0ded5] bg-white px-6 py-20 text-center shadow-sm">
            <Icon
              path={mdiPackageVariant}
              size={2.5}
              className="mx-auto mb-5 text-[#c87965]"
            />

            <h2 className="text-2xl font-black text-[#57213f]">
              No products found
            </h2>

            <p className="mt-3 text-sm text-[#805f68]">
              Try another search keyword or select a different category.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-full bg-[#57213f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#713052]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}