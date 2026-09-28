"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedLayout from "../layout";
import api from "../../../lib/axios";

type OrderItem = {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
};

type ShippingAddress = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
};

type PaymentInfo = {
  transactionId?: string;
  status?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

type Order = {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "Online";
  paymentStatus: "Pending" | "Completed" | "Failed";
  paymentInfo?: PaymentInfo;
  isPaid: boolean;
  totalPrice: number;
  deliveryType: "Standard" | "Premium";
  estimatedDeliveryDate?: string;

  orderStatus:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";

  trackingNumber?: string;
  trackingToken?: string;
  courierName?: string;
  trackingUrl?: string;

  createdAt: string;
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // Fetch Orders
  // =========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/order/myorders");

        console.log("My Orders Response:", response.data);

        if (response.data.success) {
          setOrders(response.data.orders || []);
        } else {
          setError(
            response.data.message || "Unable to load your orders."
          );
        }
      } catch (error: any) {
        console.error("Error fetching orders:", error);

        setError(
          error?.response?.data?.message ||
            "Unable to load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // =========================================
  // Format Price
  // =========================================

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // =========================================
  // Format Date
  // =========================================

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================
  // Order Status Style
  // =========================================

  const getOrderStatusStyle = (status: Order["orderStatus"]) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Shipped":
        return "bg-blue-100 text-blue-700";

      case "Processing":
        return "bg-yellow-100 text-yellow-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================
  // Payment Status Style
  // =========================================

  const getPaymentStatusStyle = (
    status: Order["paymentStatus"]
  ) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "Failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // =========================================
  // Track Order
  // =========================================

  const handleTrackOrder = (trackingToken?: string) => {
    if (!trackingToken) {
      return;
    }

    router.push(`/orders/track/${trackingToken}`);
  };

  // =========================================
  // Loading
  // =========================================

  if (loading) {
    return (
      <ProtectedLayout>
        <main className="min-h-screen bg-[#fff8f3] px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="h-4 w-32 animate-pulse rounded bg-[#ead6ce]" />

              <div className="mt-3 h-10 w-64 animate-pulse rounded bg-[#ead6ce]" />

              <div className="mt-3 h-4 w-80 animate-pulse rounded bg-[#ead6ce]" />
            </div>

            <div className="space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-56 animate-pulse rounded-[2rem] bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </main>
      </ProtectedLayout>
    );
  }

  // =========================================
  // Error
  // =========================================

  if (error) {
    return (
      <ProtectedLayout>
        <main className="min-h-screen bg-[#fff8f3] px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-5xl">
                ⚠️
              </div>

              <h2 className="mt-6 text-2xl font-black text-[#4a1d3f]">
                Unable to load orders
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-7 rounded-full bg-[#4a1d3f] px-8 py-3 font-semibold text-white transition hover:-translate-y-1 hover:bg-[#c87965]"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </ProtectedLayout>
    );
  }

  // =========================================
  // Empty Orders
  // =========================================

  if (orders.length === 0) {
    return (
      <ProtectedLayout>
        <main className="min-h-screen bg-[#fff8f3] px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c87965]">
                Order History
              </p>

              <h1 className="mt-2 text-3xl font-black text-[#4a1d3f] sm:text-4xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-[#806b72]">
                Track and manage your previous orders.
              </p>
            </div>

            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#fff0e8] text-5xl">
                📦
              </div>

              <h2 className="mt-6 text-2xl font-black text-[#4a1d3f]">
                No orders yet
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                You haven't placed any orders yet. Start shopping and your
                orders will appear here.
              </p>

              <button
                type="button"
                onClick={() => router.push("/products")}
                className="mt-7 rounded-full bg-[#4a1d3f] px-8 py-3 font-semibold text-white transition hover:-translate-y-1 hover:bg-[#c87965]"
              >
                Start Shopping
              </button>
            </div>
          </div>
        </main>
      </ProtectedLayout>
    );
  }

  // =========================================
  // Orders
  // =========================================

  return (
    <ProtectedLayout>
      <main className="min-h-screen bg-[#fff8f3] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* =========================================
              Header
          ========================================= */}

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c87965]">
              Order History
            </p>

            <h1 className="mt-2 text-3xl font-black text-[#4a1d3f] sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-[#806b72]">
              Track and manage your previous orders.
            </p>
          </div>

          {/* =========================================
              Order List
          ========================================= */}

          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-[2rem] border border-[#f0dfd7] bg-white shadow-sm"
              >

                {/* =========================================
                    Order Header
                ========================================= */}

                <div className="border-b border-[#f0dfd7] bg-[#fffaf7] px-5 py-5 sm:px-7">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Order ID
                      </p>

                      <p className="mt-1 break-all text-sm font-bold text-[#4a1d3f]">
                        #{order._id}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold ${getOrderStatusStyle(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>

                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold ${getPaymentStatusStyle(
                          order.paymentStatus
                        )}`}
                      >
                        Payment {order.paymentStatus}
                      </span>
                    </div>

                  </div>
                </div>

                {/* =========================================
                    Order Body
                ========================================= */}

                <div className="p-5 sm:p-7">

                  {/* Products */}

                  <div>
                    <h2 className="text-lg font-black text-[#4a1d3f]">
                      Products
                    </h2>

                    <div className="mt-4 space-y-3">
                      {order.orderItems.map((item, index) => (
                        <div
                          key={`${item.productId}-${index}`}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-[#f0dfd7] bg-[#fffaf7] p-4"
                        >
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-bold text-[#261923]">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Quantity: {item.quantity}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Unit Price: {formatPrice(item.price)}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-black text-[#c87965]">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* =========================================
                      Order Information
                  ========================================= */}

                  <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                    {/* Total */}

                    <div className="rounded-2xl bg-[#fff4ed] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total Amount
                      </p>

                      <p className="mt-2 text-xl font-black text-[#4a1d3f]">
                        {formatPrice(order.totalPrice)}
                      </p>
                    </div>

                    {/* Payment */}

                    <div className="rounded-2xl bg-[#fff4ed] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Payment
                      </p>

                      <p className="mt-2 text-sm font-bold text-[#4a1d3f]">
                        {order.paymentMethod === "Online"
                          ? "Online Payment"
                          : "Cash on Delivery"}
                      </p>

                      <p className="mt-1 text-xs text-green-600">
                        {order.isPaid ? "Paid" : "Payment Pending"}
                      </p>
                    </div>

                    {/* Delivery */}

                    <div className="rounded-2xl bg-[#fff4ed] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Delivery
                      </p>

                      <p className="mt-2 text-sm font-bold text-[#4a1d3f]">
                        {order.deliveryType}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {order.estimatedDeliveryDate
                          ? `Expected ${formatDate(
                              order.estimatedDeliveryDate
                            )}`
                          : "Date not available"}
                      </p>
                    </div>

                    {/* Tracking */}

                    <div className="rounded-2xl bg-[#fff4ed] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Tracking
                      </p>

                      <p className="mt-2 text-sm font-bold text-[#4a1d3f]">
                        {order.trackingNumber || "Not available"}
                      </p>

                      {order.courierName && (
                        <p className="mt-1 text-xs text-gray-500">
                          Courier: {order.courierName}
                        </p>
                      )}

                      {order.trackingToken && (
                        <button
                          type="button"
                          onClick={() =>
                            handleTrackOrder(order.trackingToken)
                          }
                          className="mt-3 text-sm font-bold text-[#c87965] transition hover:text-[#4a1d3f] hover:underline"
                        >
                          Track Order →
                        </button>
                      )}
                    </div>

                  </div>

                  {/* =========================================
                      Shipping Address
                  ========================================= */}

                  <div className="mt-7 rounded-2xl border border-[#ead6ce] p-5">
                    <h2 className="text-lg font-black text-[#4a1d3f]">
                      Delivery Address
                    </h2>

                    <div className="mt-4 text-sm leading-6 text-gray-600">
                      <p className="font-bold text-[#261923]">
                        {order.shippingAddress.fullName}
                      </p>

                      <p>
                        {order.shippingAddress.address}
                      </p>

                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.district}
                      </p>

                      <p>
                        {order.shippingAddress.state} -{" "}
                        {order.shippingAddress.postalCode}
                      </p>

                      <p>
                        {order.shippingAddress.country}
                      </p>

                      <p className="mt-2">
                        📱 {order.shippingAddress.phone}
                      </p>

                      <p>
                        ✉️ {order.shippingAddress.email}
                      </p>
                    </div>
                  </div>

                  {/* =========================================
                      Bottom Actions
                  ========================================= */}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

                    {/* Track Order Button */}

                    {order.trackingToken && (
                      <button
                        type="button"
                        onClick={() =>
                          handleTrackOrder(order.trackingToken)
                        }
                        className="rounded-full bg-[#4a1d3f] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-[#c87965]"
                      >
                        📦 Track Order
                      </button>
                    )}

                    {/* Continue Shopping */}

                    <button
                      type="button"
                      onClick={() => router.push("/products")}
                      className="rounded-full border border-[#ead6ce] px-6 py-3 text-sm font-bold text-[#4a1d3f] transition hover:bg-[#fff4ed]"
                    >
                      Continue Shopping
                    </button>

                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </ProtectedLayout>
  );
}