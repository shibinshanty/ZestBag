"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  mdiArrowLeft,
  mdiCartPlus,
  mdiHeartOutline,
  mdiMinus,
  mdiPlus,
  mdiShieldCheckOutline,
  mdiStar,
  mdiTruckFastOutline,
} from "@mdi/js";

import Icon from "@mdi/react";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import { addToCart as addToCartApi } from "../../../services/cart.service";
import { setCart } from "@/store/slices/cartSlice";
import type { CartItem } from "@/types/cart";

import { getProducts } from "@/services/product.service";

type ProductImage = {
  url?: string;
  public_id?: string;
};

type Product = {
  _id: string;
  name?: string;
  title?: string;
  price: number;
  image?: string;
  images?: ProductImage[];
  category?: string;
  description?: string;
  rating?: number;
};

type ProductsResponse = {
  products?: Product[];
  data?: Product[];
};

const PLACEHOLDER_IMAGE = "/images/product-placeholder.png";

const getProductImage = (product: Product): string => {
  const singleImage = product.image?.trim();

  if (singleImage) {
    return singleImage;
  }

  const arrayImage = product.images?.find(
    (image) => image?.url && image.url.trim() !== ""
  )?.url;

  return arrayImage?.trim() || PLACEHOLDER_IMAGE;
};

export default function ViewProductPage() {
  const params = useParams();
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const productId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  useEffect(() => {
    if (!productId) {
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts();

        const typedResponse =
          response as Product[] | ProductsResponse;

        let productData: Product[] = [];

        if (Array.isArray(typedResponse)) {
          productData = typedResponse;
        } else if (Array.isArray(typedResponse.products)) {
          productData = typedResponse.products;
        } else if (Array.isArray(typedResponse.data)) {
          productData = typedResponse.data;
        }

        const foundProduct = productData.find(
          (item) => item._id === productId
        );

        if (!foundProduct) {
          setError("Product not found.");
          return;
        }

        setProduct(foundProduct);
        setSelectedImage(getProductImage(foundProduct));
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const showNotification = (message: string) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  // =====================================================
  // BUY NOW
  // =====================================================

  const handleBuyNow = async () => {
    if (!product) {
      return;
    }

    if (!isAuthenticated || !user) {
      showNotification("Please login to continue.");
      return;
    }

    try {
      const productImage = getProductImage(product);

      const cartItem: CartItem = {
        productId: product._id,
        title: product.name || product.title || "Product",
        price: Number(product.price),
        image: productImage,
        quantity: Number(quantity),
        selected: true,
      };

      /*
       * Add/update this product in the backend cart.
       *
       * The checkout page will then use productId + quantity
       * to identify this as a Buy Now purchase.
       */
      const updatedCart = await addToCartApi(cartItem);

      dispatch(setCart(updatedCart));

      router.push(
        `/checkout?productId=${encodeURIComponent(
          product._id
        )}&quantity=${quantity}&buyNow=true`
      );
    } catch (error) {
      console.error("Buy Now failed:", error);

      showNotification(
        "Unable to start checkout. Please try again."
      );
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async () => {
    if (!product) {
      showNotification("Product is not available.");
      return;
    }

    if (!isAuthenticated || !user) {
      showNotification("Please login to add products to cart.");
      return;
    }

    try {
      const productImage = getProductImage(product);

      const cartItem: CartItem = {
        productId: product._id,
        title: product.name || product.title || "Product",
        price: Number(product.price),
        image: productImage,
        quantity: Number(quantity),
        selected: true,
      };

      const updatedCart = await addToCartApi(cartItem);

      dispatch(setCart(updatedCart));

      showNotification(
        `${product.name || product.title || "Product"} added to cart!`
      );

      /*
       * User requested:
       * Add to Cart → Cart Page
       */
      setTimeout(() => {
        router.push("/cart");
      }, 700);
    } catch (error) {
      console.error("Failed to add item to cart:", error);

      showNotification(
        "Failed to add product to cart."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-6 py-16">
        <div className="mx-auto grid max-w-7xl animate-pulse gap-10 lg:grid-cols-2">
          <div className="h-[500px] rounded-3xl bg-[#f4e6df]" />

          <div className="space-y-5">
            <div className="h-8 rounded bg-[#f4e6df]" />
            <div className="h-12 rounded bg-[#f4e6df]" />
            <div className="h-32 rounded bg-[#f4e6df]" />
            <div className="h-14 rounded bg-[#f4e6df]" />
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-6">
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#57213f]">
            {error || "Product not found"}
          </h1>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-[#57213f] px-6 py-3 font-bold text-white transition hover:bg-[#713052]"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  // =====================================================
  // IMAGES
  // =====================================================

  const images: string[] =
    product.images
      ?.map((image) => image.url?.trim())
      .filter((url): url is string => Boolean(url)) || [];

  if (images.length === 0) {
    images.push(getProductImage(product));
  }

  const productName =
    product.name || product.title || "Product";

  const totalProductPrice =
    Number(product.price) * quantity;

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-10 sm:px-6 lg:px-10">

      {/* Notification */}

      {notification && (
        <div className="fixed right-5 top-5 z-[9999] rounded-xl bg-green-600 px-6 py-4 font-bold text-white shadow-2xl">
          {notification}
        </div>
      )}

      <div className="mx-auto max-w-7xl">

        {/* Back Button */}

        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#805f68] transition hover:text-[#57213f]"
        >
          <Icon path={mdiArrowLeft} size={0.8} />
          Back to Products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* =================================================
              PRODUCT IMAGES
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative h-[420px] overflow-hidden rounded-[2rem] bg-white shadow-xl sm:h-[560px]">
              <Image
                src={
                  selectedImage ||
                  PLACEHOLDER_IMAGE
                }
                alt={`${productName} product image`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedImage(image)
                  }
                  className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 ${
                    selectedImage === image
                      ? "border-[#57213f]"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={
                      image ||
                      PLACEHOLDER_IMAGE
                    }
                    alt={`${productName} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* =================================================
              PRODUCT DETAILS
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-center"
          >

            {/* Category */}

            {product.category && (
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#c87965]">
                {product.category}
              </p>
            )}

            {/* Product Name */}

            <h1 className="text-4xl font-black leading-tight text-[#57213f] sm:text-5xl">
              {productName}
            </h1>

            {/* Rating */}

            <div className="mt-5 flex items-center gap-2 text-[#d49a4c]">
              <Icon path={mdiStar} size={0.8} />

              <span className="font-bold">
                {product.rating ?? "4.8"}
              </span>

              <span className="text-sm text-[#805f68]">
                Customer rating
              </span>
            </div>

            {/* Price */}

            <p className="mt-6 text-4xl font-black text-[#c87965]">
              ₹
              {Number(product.price).toLocaleString(
                "en-IN"
              )}
            </p>

            {/* Description */}

            <p className="mt-6 leading-8 text-[#805f68]">
              {product.description ||
                "A carefully selected product with excellent quality and stylish design."}
            </p>

            {/* Quantity */}

            <div className="mt-8">
              <p className="mb-3 text-sm font-bold text-[#57213f]">
                Quantity
              </p>

              <div className="flex w-fit items-center gap-5 rounded-full border border-[#ead6ce] bg-white px-4 py-2">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff5ef] text-[#57213f] transition hover:bg-[#57213f] hover:text-white"
                >
                  <Icon
                    path={mdiMinus}
                    size={0.7}
                  />
                </button>

                <span className="min-w-5 text-center font-bold text-[#57213f]">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (current) => current + 1
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff5ef] text-[#57213f] transition hover:bg-[#57213f] hover:text-white"
                >
                  <Icon
                    path={mdiPlus}
                    size={0.7}
                  />
                </button>

              </div>

              {/* Selected quantity total */}

              <div className="mt-4 rounded-2xl bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#805f68]">
                    {quantity} × Product Price
                  </span>

                  <span className="font-black text-[#57213f]">
                    ₹
                    {totalProductPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="mt-8 flex flex-col gap-3">

              {/* BUY NOW */}

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#c87965] px-6 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-[#b76552]"
              >
                ⚡ Buy Now
              </button>

              {/* ADD TO CART + WISHLIST */}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-3 rounded-full bg-[#57213f] px-6 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-[#713052]"
                >
                  <Icon
                    path={mdiCartPlus}
                    size={1}
                  />

                  Add to Cart
                </button>

                <button
                  type="button"
                  className="rounded-full border border-[#ead6ce] bg-white px-5 text-[#57213f] transition hover:border-[#57213f]"
                >
                  <Icon
                    path={mdiHeartOutline}
                    size={1}
                  />
                </button>

              </div>
            </div>

            {/* Benefits */}

            <div className="mt-10 grid gap-4 border-t border-[#ead6ce] pt-6 sm:grid-cols-3">

              <div className="flex items-center gap-2 text-xs font-semibold text-[#805f68]">
                <Icon
                  path={mdiTruckFastOutline}
                  size={1}
                  className="text-[#c87965]"
                />
                Fast Delivery
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#805f68]">
                <Icon
                  path={mdiShieldCheckOutline}
                  size={1}
                  className="text-[#c87965]"
                />
                Secure Payment
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#805f68]">
                <Icon
                  path={mdiHeartOutline}
                  size={1}
                  className="text-[#c87965]"
                />
                Quality Product
              </div>

            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}