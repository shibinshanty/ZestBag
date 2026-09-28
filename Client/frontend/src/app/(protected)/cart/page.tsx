"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedLayout from "../layout";

import type { RootState } from "../../../store/store";
import type { CartItem } from "../../../types/cart";

import { setCart } from "../../../store/slices/cartSlice";

import {
  addToCart,
  getCart,
  removeQuantity,
  deleteFromCart,
} from "../../../services/cart.service";

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const cart = useSelector((state: RootState) => state.cart.cart);

  const handleDecrease = async (productId: string) => {
    try {
      await removeQuantity(productId, 1);

      const updatedCart = await getCart();

      dispatch(setCart(updatedCart));
    } catch (error) {
      console.error("Error decreasing quantity:", error);
    }
  };

  const handleIncrease = async (item: CartItem) => {
    try {
      await addToCart({
        productId: item.productId,
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: 1,
        selected: item.selected,
      });

      const updatedCart = await getCart();

      dispatch(setCart(updatedCart));
    } catch (error) {
      console.error("Error increasing quantity:", error);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await deleteFromCart(productId);

      const updatedCart = await getCart();

      dispatch(setCart(updatedCart));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const total = cart
    ? cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
    : 0;

  const totalItems = cart
    ? cart.items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const deliveryCharge = total >= 999 || total === 0 ? 0 : 49;

  const grandTotal = total + deliveryCharge;

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

  return (
    <ProtectedLayout>
      <main className="min-h-screen bg-[#fff8f3] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c87965]">
              Shopping Bag
            </p>

            <h1 className="mt-2 text-3xl font-black text-[#4a1d3f] sm:text-4xl">
              Your Cart
            </h1>

            <p className="mt-2 text-sm text-[#806b72]">
              Review your selected products before checkout.
            </p>
          </div>

          {/* Empty Cart */}
          {!cart || cart.items.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#fff0e8] text-5xl">
                🛒
              </div>

              <h2 className="mt-6 text-2xl font-black text-[#4a1d3f]">
                Your cart is empty
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                Looks like you haven’t added anything to your cart yet. Explore
                our products and find something you love.
              </p>

              <button
                type="button"
                onClick={() => router.push("/products")}
                className="mt-7 rounded-full bg-[#4a1d3f] px-8 py-3 font-semibold text-white transition hover:-translate-y-1 hover:bg-[#c87965]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              {/* Cart Items Section */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#4a1d3f]">
                    Cart Items
                  </h2>

                  <span className="rounded-full bg-[#f4e2d9] px-4 py-2 text-sm font-bold text-[#4a1d3f]">
                    {totalItems} {totalItems === 1 ? "Item" : "Items"}
                  </span>
                </div>

                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.productId}
                      className="group rounded-[1.5rem] border border-[#f0dfd7] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-5"
                    >
                      <div className="flex gap-4 sm:gap-5">
                        {/* Product Image */}
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#fff5ef] sm:h-36 sm:w-36">
                          <Image
                            src={
                              item.image || "/images/product-placeholder.png"
                            }
                            alt={item.title}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                            sizes="144px"
                            unoptimized
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="line-clamp-2 text-base font-bold text-[#261923] sm:text-lg">
                                {item.title}
                              </h3>

                              <button
                                type="button"
                                onClick={() => handleRemove(item.productId)}
                                className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                aria-label={`Remove ${item.title}`}
                              >
                                ✕
                              </button>
                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                              Unit price:{" "}
                              <span className="font-semibold text-[#4a1d3f]">
                                {formatPrice(item.price)}
                              </span>
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            {/* Quantity Control */}
                            <div className="flex items-center gap-3 rounded-full border border-[#ead6ce] bg-[#fffaf7] px-2 py-1">
                              <button
                                type="button"
                                onClick={() => handleDecrease(item.productId)}
                                disabled={item.quantity <= 1}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-[#4a1d3f] transition hover:bg-[#4a1d3f] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                −
                              </button>

                              <span className="min-w-5 text-center text-sm font-bold text-[#261923]">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleIncrease(item)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-[#4a1d3f] transition hover:bg-[#4a1d3f] hover:text-white"
                              >
                                +
                              </button>
                            </div>

                            {/* Item Total */}
                            <p className="text-lg font-black text-[#c87965]">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <button
                  type="button"
                  onClick={() => router.push("/products")}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#4a1d3f] transition hover:text-[#c87965]"
                >
                  ← Continue Shopping
                </button>
              </section>

              {/* Order Summary */}
              <aside className="h-fit rounded-[2rem] border border-[#f0dfd7] bg-white p-6 shadow-sm lg:sticky lg:top-6">
                <h2 className="text-xl font-black text-[#4a1d3f]">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Items</span>
                    <span className="font-semibold text-[#261923]">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#261923]">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery</span>

                    <span
                      className={`font-semibold ${
                        deliveryCharge === 0
                          ? "text-green-600"
                          : "text-[#261923]"
                      }`}
                    >
                      {deliveryCharge === 0
                        ? "FREE"
                        : formatPrice(deliveryCharge)}
                    </span>
                  </div>
                </div>

                {/* Free Delivery Message */}
                <div className="mt-6 rounded-2xl bg-[#fff4ed] p-4 text-sm leading-6 text-[#805f68]">
                  {deliveryCharge === 0 ? (
                    <p>
                      🎉 You have unlocked{" "}
                      <span className="font-bold text-[#4a1d3f]">
                        free delivery
                      </span>
                      !
                    </p>
                  ) : (
                    <p>
                      Add{" "}
                      <span className="font-bold text-[#4a1d3f]">
                        {formatPrice(999 - total)}
                      </span>{" "}
                      more to get free delivery.
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 flex items-center justify-between border-t border-dashed border-[#ead6ce] pt-5">
                  <span className="text-lg font-bold text-[#261923]">
                    Total
                  </span>

                  <span className="text-2xl font-black text-[#4a1d3f]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#4a1d3f] px-6 py-4 font-bold text-white shadow-lg shadow-[#4a1d3f]/20 transition hover:-translate-y-1 hover:bg-[#c87965]"
                >
                  Proceed to Checkout
                  <span className="text-lg">→</span>
                </button>

                {/* Secure Checkout */}
                <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                  <span>🔒</span>
                  Secure and safe checkout
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </ProtectedLayout>
  );
}
