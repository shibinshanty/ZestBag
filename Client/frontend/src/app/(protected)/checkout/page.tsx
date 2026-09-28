"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

import api from "../../../lib/axios";
import type { RootState } from "../../../store/store";
import Notification from "../../../components/notification/Notification";
import ProtectedLayout from "../layout";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type BuyNowItem = {
  productId: string;
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cart = useSelector(
    (state: RootState) => state.cart.cart
  );

  // =====================================================
  // BUY NOW PARAMETERS
  // =====================================================

  const buyNowProductId =
    searchParams.get("productId");

  const buyNowQuantity = Number(
    searchParams.get("quantity") || "1"
  );

  const isBuyNow =
    searchParams.get("buyNow") === "true" &&
    !!buyNowProductId;

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [showNotification, setShowNotification] =
    useState(false);

  const [notificationType, setNotificationType] =
    useState<
      "success" | "error" | "warning" | "info"
    >("success");

  const [notificationTitle, setNotificationTitle] =
    useState("");

  const [notificationMessage, setNotificationMessage] =
    useState("");

  const showMessage = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    setNotificationType(type);
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  // =====================================================
  // FORM STATE
  // =====================================================

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
  });

  // =====================================================
  // BUY NOW ITEM
  // =====================================================

  const buyNowItem = useMemo(() => {
    if (!isBuyNow || !cart || !buyNowProductId) {
      return null;
    }

    const item = cart.items.find(
      (cartItem) =>
        String(cartItem.productId) ===
        String(buyNowProductId)
    );

    if (!item) {
      return null;
    }

    return {
      ...item,
      quantity: buyNowQuantity,
      selected: true,
    };
  }, [
    cart,
    buyNowProductId,
    buyNowQuantity,
    isBuyNow,
  ]);

  // =====================================================
  // CHECKOUT ITEMS
  // =====================================================

  const checkoutItems = useMemo(() => {
    if (!cart) {
      return [];
    }

    // Buy Now = only selected product
    if (isBuyNow) {
      return buyNowItem ? [buyNowItem] : [];
    }

    // Normal checkout = selected cart products
    return cart.items.filter(
      (item) => item.selected === true
    );
  }, [cart, isBuyNow, buyNowItem]);

  // =====================================================
  // CART CALCULATIONS
  // =====================================================

  const total = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }, [checkoutItems]);

  const totalItems = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) =>
        sum + Number(item.quantity),
      0
    );
  }, [checkoutItems]);

  const deliveryCharge =
    total >= 999 || total === 0
      ? 0
      : 49;

  const grandTotal =
    total + deliveryCharge;

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // LOAD RAZORPAY
  // =====================================================

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(script);
    });
  };

  // =====================================================
  // SUBMIT / PAYMENT
  // =====================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // ---------------------------------------------------
    // Validate checkout items
    // ---------------------------------------------------

    if (checkoutItems.length === 0) {
      showMessage(
        "error",
        "No Products",
        isBuyNow
          ? "The selected product is no longer available in your cart."
          : "Please select at least one product before checkout."
      );

      return;
    }

    // ---------------------------------------------------
    // Validate total
    // ---------------------------------------------------

    if (grandTotal <= 0) {
      showMessage(
        "error",
        "Invalid Amount",
        "The order amount must be greater than zero."
      );

      return;
    }

    try {
      // =================================================
      // 1. LOAD RAZORPAY
      // =================================================

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        showMessage(
          "error",
          "Payment Error",
          "Razorpay failed to load. Please try again."
        );

        return;
      }

      // =================================================
      // 2. CREATE RAZORPAY ORDER
      // =================================================

      const response =
        await api.post(
          "/api/order/razorpay/create-order",
          {
            amount: grandTotal,
          }
        );

      const razorpayOrder =
        response.data.order;

      const razorpayKey =
        response.data.key;

      // =================================================
      // 3. OPEN RAZORPAY
      // =================================================

      const options = {
        key: razorpayKey,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        name: "Your Store",

        description: isBuyNow
          ? "Buy Now Order"
          : "Order Payment",

        order_id:
          razorpayOrder.id,

        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },

        notes: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
        },

        theme: {
          color: "#4a1d3f",
        },

        // =================================================
        // PAYMENT SUCCESS
        // =================================================

        handler: async function (
          paymentResponse: any
        ) {
          try {
            // =============================================
            // 4. VERIFY PAYMENT
            // =============================================

            const verifyResponse =
              await api.post(
                "/api/order/razorpay/verify",
                {
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  shippingAddress: {
                    fullName:
                      formData.fullName,

                    phone:
                      formData.phone,

                    email:
                      formData.email,

                    address:
                      formData.address,

                    city:
                      formData.city,

                    district:
                      formData.district,

                    state:
                      formData.state,

                    postalCode:
                      formData.pincode,

                    country: "India",
                  },

                  deliveryType:
                    "Standard",

                  // =======================================
                  // BUY NOW INFORMATION
                  // =======================================

                  ...(isBuyNow
                    ? {
                        buyNow: {
                          productId:
                            buyNowProductId,

                          quantity:
                            buyNowQuantity,
                        } satisfies BuyNowItem,
                      }
                    : {}),
                }
              );

            // =============================================
            // PAYMENT VERIFIED
            // =============================================

            if (
              verifyResponse.data.success
            ) {
              const createdOrder =
                verifyResponse.data.order;

              const trackingToken =
                createdOrder?.trackingToken;

              console.log(
                "Created Order:",
                createdOrder
              );

              console.log(
                "Tracking Token:",
                trackingToken
              );

              if (trackingToken) {
                sessionStorage.setItem(
                  "latestTrackingToken",
                  trackingToken
                );

                console.log(
                  "Tracking URL:",
                  `/orders/track/${trackingToken}`
                );
              }

              showMessage(
                "success",
                "Order Placed Successfully",
                "Your payment was successful and your order has been placed."
              );

              // ===========================================
              // GO TO ORDERS
              // ===========================================

              setTimeout(() => {
                router.push("/orders");
              }, 1500);
            } else {
              showMessage(
                "error",
                "Payment Verification Failed",
                verifyResponse.data.message ||
                  "We could not verify your payment. Please try again."
              );
            }
          } catch (error: any) {
            console.error(
              "Payment verification failed:",
              error
            );

            showMessage(
              "error",
              "Payment Verification Failed",
              error?.response?.data?.message ||
                "Payment verification failed. Please contact support if the amount was deducted."
            );
          }
        },

        // =================================================
        // RAZORPAY CLOSED
        // =================================================

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay checkout closed"
            );

            showMessage(
              "warning",
              "Payment Cancelled",
              "You closed the payment window. Your order was not placed."
            );
          },
        },
      };

      const paymentObject =
        new window.Razorpay(options);

      paymentObject.open();
    } catch (error: any) {
      console.error(
        "Payment initialization failed:",
        error
      );

      showMessage(
        "error",
        "Payment Failed",
        error?.response?.data?.message ||
          "Unable to start payment. Please try again."
      );
    }
  };

  // =====================================================
  // EMPTY CART / INVALID BUY NOW
  // =====================================================

  if (!cart || checkoutItems.length === 0) {
    return (
      <ProtectedLayout>
        <main className="min-h-screen bg-[#fff8f3] px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
            <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff0e8] text-4xl">
                🛒
              </div>

              <h1 className="mt-6 text-2xl font-black text-[#4a1d3f]">
                {isBuyNow
                  ? "Product Not Available"
                  : "Your Cart Is Empty"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {isBuyNow
                  ? "The selected product could not be found in your cart. Please go back to the product page and try Buy Now again."
                  : "Please add products to your cart before proceeding to checkout."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    isBuyNow
                      ? "/products"
                      : "/cart"
                  )
                }
                className="mt-7 rounded-full bg-[#4a1d3f] px-8 py-3 font-bold text-white transition hover:bg-[#c87965]"
              >
                {isBuyNow
                  ? "Back to Products"
                  : "Back to Cart"}
              </button>

            </div>
          </div>
        </main>
      </ProtectedLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <ProtectedLayout>
      <main className="min-h-screen bg-[#fff8f3] px-4 py-8 sm:px-6 lg:px-10">

        <div className="mx-auto max-w-7xl">

          {/* Header */}

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c87965]">
              Secure Checkout
            </p>

            <h1 className="mt-2 text-3xl font-black text-[#4a1d3f] sm:text-4xl">
              {isBuyNow
                ? "Buy Now"
                : "Complete Your Order"}
            </h1>

            <p className="mt-2 text-sm text-[#806b72]">
              Enter your delivery details to place your order.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[1fr_380px]"
          >

            {/* =================================================
                CUSTOMER DETAILS
            ================================================= */}

            <section className="space-y-6">

              <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">

                <h2 className="text-xl font-black text-[#4a1d3f]">
                  Customer Details
                </h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  {/* Full Name */}

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-[#ead6ce] px-4 py-3 outline-none transition focus:border-[#4a1d3f]"
                    />
                  </div>

                  {/* Phone */}

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Mobile Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-[#ead6ce] px-4 py-3 outline-none transition focus:border-[#4a1d3f]"
                    />
                  </div>

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#ead6ce] px-4 py-3 outline-none transition focus:border-[#4a1d3f]"
                    />
                  </div>

                </div>
              </div>

              {/* =================================================
                  DELIVERY ADDRESS
              ================================================= */}

              <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">

                <h2 className="text-xl font-black text-[#4a1d3f]">
                  Delivery Address
                </h2>

                <div className="mt-6 space-y-5">

                  {/* Address */}

                  <div>
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Full Address
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={4}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House name, street, landmark"
                      className="w-full resize-none rounded-xl border border-[#ead6ce] px-4 py-3 outline-none transition focus:border-[#4a1d3f]"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* City */}

                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        City / Town
                      </label>

                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City or town"
                        className="w-full rounded-xl border border-[#ead6ce] px-4 py-3 outline-none transition focus:border-[#4a1d3f]"
                      />
                    </div>

                    {/* District */}

                    <div>
                      <label
                        htmlFor="district"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        District
                      </label>

                      <input
                        id="district"
                        name="district"
                        type="text"
                        required
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="District"
                        className="w-full rounded-xl border border-[#ead6ce] px-4 py-3 outline-none transition focus:border-[#4a1d3f]"
                      />
                    </div>

                    {/* State */}

                    <div>
                      <label
                        htmlFor="state"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        State
                      </label>

                      <input
                        id="state"
                        name="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full rounded-xl border border-[#ead6ce] px-4 py-3 outline-none transition focus:border-[#4a1d3f]"
                      />
                    </div>

                    {/* Pincode */}

                    <div>
                      <label
                        htmlFor="pincode"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Pincode
                      </label>

                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        required
                        pattern="[0-9]{6}"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit pincode"
                        className="w-full rounded-xl border border-[#ead6ce] px-4 py-3 outline-none transition focus:border-[#4a1d3f]"
                      />
                    </div>

                  </div>
                </div>
              </div>

            </section>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-sm lg:sticky lg:top-6">

              <h2 className="text-xl font-black text-[#4a1d3f]">
                Order Summary
              </h2>

              {isBuyNow && (
                <div className="mt-3 rounded-xl bg-[#fff4ed] px-4 py-3 text-sm font-semibold text-[#c87965]">
                  ⚡ Buy Now Order
                </div>
              )}

              {/* Products */}

              <div className="mt-6 space-y-4">

                {checkoutItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 border-b border-[#f0dfd7] pb-4"
                  >
                    <div className="flex-1">

                      <p className="font-semibold text-[#261923]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.quantity} ×{" "}
                        {formatPrice(item.price)}
                      </p>

                    </div>

                    <p className="font-bold text-[#4a1d3f]">
                      {formatPrice(
                        Number(item.price) *
                          Number(item.quantity)
                      )}
                    </p>
                  </div>
                ))}

              </div>

              {/* Price Breakdown */}

              <div className="mt-6 space-y-4 text-sm">

                <div className="flex justify-between text-gray-600">
                  <span>Items</span>

                  <span className="font-semibold text-[#261923]">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>

                  <span className="font-semibold text-[#261923]">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>

                  <span className="font-semibold text-[#261923]">
                    {deliveryCharge === 0
                      ? "FREE"
                      : formatPrice(
                          deliveryCharge
                        )}
                  </span>
                </div>

              </div>

              {/* Grand Total */}

              <div className="mt-6 flex items-center justify-between border-t border-dashed border-[#ead6ce] pt-5">

                <span className="text-lg font-bold text-[#261923]">
                  Total
                </span>

                <span className="text-2xl font-black text-[#4a1d3f]">
                  {formatPrice(grandTotal)}
                </span>

              </div>

              {/* Pay Button */}

              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-[#4a1d3f] px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#c87965]"
              >
                Pay {formatPrice(grandTotal)}
              </button>

              {/* Back */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    isBuyNow
                      ? "/products"
                      : "/cart"
                  )
                }
                className="mt-3 w-full rounded-full border border-[#ead6ce] px-6 py-3 font-semibold text-[#4a1d3f] transition hover:bg-[#fff4ed]"
              >
                {isBuyNow
                  ? "Back to Products"
                  : "Back to Cart"}
              </button>

              <p className="mt-5 text-center text-xs text-gray-500">
                🔒 Your information is secure.
              </p>

            </aside>

          </form>
        </div>

        {/* Notification */}

        {showNotification && (
          <Notification
            type={notificationType}
            title={notificationTitle}
            message={notificationMessage}
            onClose={() =>
              setShowNotification(false)
            }
          />
        )}

      </main>
    </ProtectedLayout>
  );
}