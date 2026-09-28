"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Icon from "@mdi/react";

import {
  mdiArrowLeft,
  mdiPackageVariant,
  mdiAccountOutline,
  mdiMapMarkerOutline,
  mdiPhoneOutline,
  mdiEmailOutline,
  mdiCreditCardOutline,
  mdiTruckDeliveryOutline,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiAlertCircleOutline,
  mdiCalendarOutline,
  mdiIdentifier,
  mdiContentSaveOutline,
  mdiLinkVariant,
} from "@mdi/js";

import {
  getOrderById,
  updateOrderStatus,
  updateOrderTracking,
} from "../../../../services/order.service";

import type {
  Order,
  OrderStatus,
} from "../../../../services/order.service";

type StatusConfig = {
  label: string;
  description: string;
  icon: string;
  active: boolean;
};

export default function AdminOrderDetailsPage() {
  const params = useParams();

  const orderId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // TRACKING MANAGEMENT
  // =====================================================

  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>("Pending");

  const [statusSaving, setStatusSaving] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [statusError, setStatusError] =
    useState("");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [courierName, setCourierName] =
    useState("");

  const [trackingUrl, setTrackingUrl] =
    useState("");

  const [trackingSaving, setTrackingSaving] =
    useState(false);

  const [trackingMessage, setTrackingMessage] =
    useState("");

  const [trackingError, setTrackingError] =
    useState("");

  // =====================================================
  // FETCH ORDER
  // =====================================================

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getOrderById(orderId);

        setOrder(data);
        setSelectedStatus(data.orderStatus);
        setTrackingNumber(data.trackingNumber || "");
        setCourierName(data.courierName || "");
        setTrackingUrl(data.trackingUrl || "");
      } catch (error: any) {
        console.error(
          "Admin order details error:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Unable to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const handleStatusUpdate = async () => {
    if (!order) return;

    try {
      setStatusSaving(true);
      setStatusMessage("");
      setStatusError("");

      const updatedOrder = await updateOrderStatus(
        order._id,
        selectedStatus,
        selectedStatus === "Cancelled"
          ? order.cancellationReason
          : undefined
      );

      setOrder(updatedOrder);
      setStatusMessage("Order status updated successfully.");
    } catch (error: any) {
      console.error("Update order status error:", error);
      setStatusError(
        error?.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setStatusSaving(false);
    }
  };

  // =====================================================
  // UPDATE TRACKING INFORMATION
  // =====================================================

  const handleTrackingUpdate = async () => {
    if (!order) return;

    const cleanTrackingNumber = trackingNumber.trim();
    const cleanCourierName = courierName.trim();
    const cleanTrackingUrl = trackingUrl.trim();

    if (!cleanCourierName) {
      setTrackingError("Please enter the courier name.");
      setTrackingMessage("");
      return;
    }

    if (!cleanTrackingNumber) {
      setTrackingError("Please enter the tracking number.");
      setTrackingMessage("");
      return;
    }

    if (cleanTrackingUrl) {
      try {
        new URL(cleanTrackingUrl);
      } catch {
        setTrackingError("Please enter a valid tracking URL.");
        setTrackingMessage("");
        return;
      }
    }

    try {
      setTrackingSaving(true);
      setTrackingMessage("");
      setTrackingError("");

      const updatedOrder = await updateOrderTracking(
        order._id,
        cleanTrackingNumber,
        cleanCourierName,
        cleanTrackingUrl
      );

      setOrder(updatedOrder);
      setTrackingNumber(updatedOrder.trackingNumber || cleanTrackingNumber);
      setCourierName(updatedOrder.courierName || cleanCourierName);
      setTrackingUrl(updatedOrder.trackingUrl || cleanTrackingUrl);
      setTrackingMessage("Tracking information saved successfully.");
    } catch (error: any) {
      console.error("Update tracking error:", error);
      setTrackingError(
        error?.response?.data?.message ||
          "Unable to save tracking information."
      );
    } finally {
      setTrackingSaving(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) return "-";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT DATE + TIME
  // =====================================================

  const formatDateTime = (
    date?: string
  ) => {
    if (!date) return "-";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (
    status: OrderStatus
  ) => {
    switch (status) {
      case "Pending":
        return {
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          icon: mdiClockOutline,
        };

      case "Processing":
        return {
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
          icon: mdiPackageVariant,
        };

      case "Shipped":
        return {
          className:
            "bg-purple-50 text-purple-700 border-purple-200",
          icon: mdiTruckDeliveryOutline,
        };

      case "Delivered":
        return {
          className:
            "bg-green-50 text-green-700 border-green-200",
          icon: mdiCheckCircleOutline,
        };

      case "Cancelled":
        return {
          className:
            "bg-red-50 text-red-700 border-red-200",
          icon: mdiAlertCircleOutline,
        };

      default:
        return {
          className:
            "bg-slate-50 text-slate-700 border-slate-200",
          icon: mdiPackageVariant,
        };
    }
  };

  // =====================================================
  // PAYMENT STYLE
  // =====================================================

  const getPaymentStyle = (
    status: string
  ) => {
    switch (status) {
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";

      case "Failed":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  // =====================================================
  // TRACKING STATUS
  // =====================================================

  const getTrackingStatuses = (): StatusConfig[] => {
    const currentStatus =
      order?.orderStatus;

    const statusOrder: OrderStatus[] = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
    ];

    const currentIndex =
      statusOrder.indexOf(
        currentStatus || "Pending"
      );

    return [
      {
        label: "Order Placed",
        description:
          "Order has been placed successfully.",
        icon: mdiCheckCircleOutline,
        active:
          currentIndex >= 0,
      },
      {
        label: "Processing",
        description:
          "Order is being prepared.",
        icon: mdiPackageVariant,
        active:
          currentIndex >= 1,
      },
      {
        label: "Shipped",
        description:
          "Order has been handed over for delivery.",
        icon: mdiTruckDeliveryOutline,
        active:
          currentIndex >= 2,
      },
      {
        label: "Delivered",
        description:
          "Order has been delivered.",
        icon: mdiCheckCircleOutline,
        active:
          currentIndex >= 3,
      },
    ];
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#57213f]" />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading order details...
            </p>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">

        <div className="mx-auto max-w-3xl">

          <Link
            href="/admin/orders"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#57213f] hover:underline"
          >
            <Icon
              path={mdiArrowLeft}
              size={0.7}
            />

            Back to Orders
          </Link>

          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <Icon
              path={mdiAlertCircleOutline}
              size={2}
              className="mx-auto text-red-400"
            />

            <h1 className="mt-4 text-xl font-bold text-slate-800">
              Unable to Load Order
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "Order not found."}
            </p>

          </div>

        </div>

      </main>
    );
  }

  const statusStyle =
    getStatusStyle(
      order.orderStatus
    );

  const trackingStatuses =
    getTrackingStatuses();

  const productTotal =
    order.orderItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="mb-6">

          <Link
            href="/admin/orders"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#57213f] hover:underline"
          >
            <Icon
              path={mdiArrowLeft}
              size={0.7}
            />

            Back to Orders
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order Details
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#57213f]">

                #
                {order._id
                  .slice(-8)
                  .toUpperCase()}

              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Placed on{" "}
                {formatDateTime(
                  order.createdAt
                )}
              </p>

            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusStyle.className}`}
            >

              <Icon
                path={
                  statusStyle.icon
                }
                size={0.75}
              />

              {order.orderStatus}

            </div>

          </div>

        </div>

        {/* =================================================
            MAIN GRID
            ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* =================================================
              LEFT COLUMN
              ================================================= */}

          <div className="space-y-6">

            {/* =================================================
                ORDER ITEMS
                ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#57213f]/10 text-[#57213f]">

                    <Icon
                      path={
                        mdiPackageVariant
                      }
                      size={0.9}
                    />

                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Order Items
                    </h2>

                    <p className="text-xs text-slate-500">
                      {order.orderItems.length}{" "}
                      {order.orderItems.length ===
                      1
                        ? "item"
                        : "items"}
                    </p>

                  </div>

                </div>

              </div>

              <div className="divide-y divide-slate-100">

                {order.orderItems.map(
                  (item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex gap-4 p-5"
                    >

                      {/* IMAGE */}

                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">

                            <Icon
                              path={
                                mdiPackageVariant
                              }
                              size={1.2}
                            />

                          </div>
                        )}

                      </div>

                      {/* DETAILS */}

                      <div className="min-w-0 flex-1">

                        <h3 className="font-bold text-slate-900">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Product ID:{" "}
                          {item.productId}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">

                          <span className="text-slate-500">
                            Qty:{" "}
                            <strong className="text-slate-800">
                              {item.quantity}
                            </strong>
                          </span>

                          <span className="text-slate-500">
                            Price:{" "}
                            <strong className="text-slate-800">
                              ₹
                              {Number(
                                item.price
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </span>

                        </div>

                      </div>

                      {/* TOTAL */}

                      <div className="text-right">

                        <p className="text-xs text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 font-black text-slate-900">

                          ₹
                          {(
                            Number(
                              item.price
                            ) *
                            Number(
                              item.quantity
                            )
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* TOTALS */}

              <div className="border-t border-slate-100 bg-slate-50 p-5">

                <div className="ml-auto max-w-sm space-y-3">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Product Total
                    </span>

                    <span className="font-semibold text-slate-800">
                      ₹
                      {productTotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Delivery
                    </span>

                    <span className="font-semibold text-slate-800">

                      {order.totalPrice >
                      productTotal
                        ? `₹${(
                            order.totalPrice -
                            productTotal
                          ).toLocaleString(
                            "en-IN"
                          )}`
                        : "Free"}

                    </span>

                  </div>

                  <div className="border-t border-slate-200 pt-3">

                    <div className="flex justify-between">

                      <span className="font-bold text-slate-900">
                        Order Total
                      </span>

                      <span className="text-xl font-black text-[#57213f]">
                        ₹
                        {Number(
                          order.totalPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                CUSTOMER
                ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                  <Icon
                    path={
                      mdiAccountOutline
                    }
                    size={0.9}
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Customer Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Customer details
                  </p>

                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Full Name
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {order.shippingAddress.fullName}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <Icon
                      path={
                        mdiEmailOutline
                      }
                      size={0.65}
                      className="text-slate-400"
                    />

                    <p className="break-all text-sm font-semibold text-slate-800">
                      {order.shippingAddress.email}
                    </p>

                  </div>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <Icon
                      path={
                        mdiPhoneOutline
                      }
                      size={0.65}
                      className="text-slate-400"
                    />

                    <p className="text-sm font-semibold text-slate-800">
                      {order.shippingAddress.phone}
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SHIPPING ADDRESS
                ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                  <Icon
                    path={
                      mdiMapMarkerOutline
                    }
                    size={0.9}
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Shipping Address
                  </h2>

                  <p className="text-xs text-slate-500">
                    Delivery address
                  </p>

                </div>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="font-bold text-slate-900">
                  {order.shippingAddress.fullName}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">

                  {order.shippingAddress.address}
                  <br />

                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.district}
                  <br />

                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.postalCode}
                  <br />

                  {order.shippingAddress.country}

                </p>

              </div>

            </section>

            {/* =================================================
                TRACKING MANAGEMENT
                ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#57213f]/10 text-[#57213f]">
                  <Icon path={mdiTruckDeliveryOutline} size={0.9} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Manage Order Tracking
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update shipment status and courier details
                  </p>
                </div>

              </div>

              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Order Status
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      value={selectedStatus}
                      onChange={(event) => {
                        setSelectedStatus(event.target.value as OrderStatus);
                        setStatusMessage("");
                        setStatusError("");
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#57213f] focus:ring-2 focus:ring-[#57213f]/10"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleStatusUpdate}
                      disabled={statusSaving || selectedStatus === order.orderStatus}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#57213f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#451931] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon path={mdiContentSaveOutline} size={0.7} />
                      {statusSaving ? "Updating..." : "Update Status"}
                    </button>
                  </div>

                  {statusMessage && (
                    <p className="mt-2 text-xs font-semibold text-green-600">
                      {statusMessage}
                    </p>
                  )}
                  {statusError && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {statusError}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Courier Name
                    </label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(event) => setCourierName(event.target.value)}
                      placeholder="e.g. Delhivery"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#57213f] focus:ring-2 focus:ring-[#57213f]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(event) => setTrackingNumber(event.target.value)}
                      placeholder="e.g. DL123456789"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#57213f] focus:ring-2 focus:ring-[#57213f]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Tracking URL <span className="font-normal normal-case text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Icon
                      path={mdiLinkVariant}
                      size={0.7}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="url"
                      value={trackingUrl}
                      onChange={(event) => setTrackingUrl(event.target.value)}
                      placeholder="https://courier.example.com/track/..."
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#57213f] focus:ring-2 focus:ring-[#57213f]/10"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTrackingUpdate}
                  disabled={trackingSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <Icon path={mdiContentSaveOutline} size={0.75} />
                  {trackingSaving ? "Saving Tracking..." : "Save Tracking Information"}
                </button>

                {trackingMessage && (
                  <p className="text-xs font-semibold text-green-600">
                    {trackingMessage}
                  </p>
                )}
                {trackingError && (
                  <p className="text-xs font-semibold text-red-600">
                    {trackingError}
                  </p>
                )}

              </div>

            </section>

            {/* =================================================
                TRACKING
                ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                  <Icon
                    path={
                      mdiTruckDeliveryOutline
                    }
                    size={0.9}
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Order Tracking
                  </h2>

                  <p className="text-xs text-slate-500">
                    Current delivery progress
                  </p>

                </div>

              </div>

              {/* TIMELINE */}

              <div className="space-y-0">

                {trackingStatuses.map(
                  (tracking, index) => {

                    const isLast =
                      index ===
                      trackingStatuses.length -
                        1;

                    return (
                      <div
                        key={
                          tracking.label
                        }
                        className="relative flex gap-4"
                      >

                        {/* LINE */}

                        {!isLast && (
                          <div
                            className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 ${
                              tracking.active
                                ? "bg-[#57213f]"
                                : "bg-slate-200"
                            }`}
                          />
                        )}

                        {/* ICON */}

                        <div
                          className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                            tracking.active
                              ? "border-[#57213f] bg-[#57213f] text-white"
                              : "border-slate-200 bg-white text-slate-300"
                          }`}
                        >

                          <Icon
                            path={
                              tracking.icon
                            }
                            size={0.55}
                          />

                        </div>

                        {/* CONTENT */}

                        <div className="pb-7">

                          <p
                            className={`font-bold ${
                              tracking.active
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}
                          >
                            {tracking.label}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              tracking.active
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {tracking.description}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              {/* TRACKING INFORMATION */}

              {(order.trackingNumber || order.courierName || order.trackingUrl || order.shippedAt || order.deliveredAt) && (
                <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50 p-4">

                  {order.courierName && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                        Courier
                      </p>
                      <p className="mt-1 font-bold text-purple-900">
                        {order.courierName}
                      </p>
                    </div>
                  )}

                  {order.trackingNumber && (
                    <div className={order.courierName ? "mt-4" : ""}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                        Tracking Number
                      </p>
                      <p className="mt-1 font-black text-purple-900">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}

                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-purple-700 hover:underline"
                    >
                      <Icon path={mdiLinkVariant} size={0.6} />
                      Track Shipment
                    </a>
                  )}

                  {(order.shippedAt || order.deliveredAt) && (
                    <div className="mt-4 grid gap-3 border-t border-purple-100 pt-4 sm:grid-cols-2">
                      {order.shippedAt && (
                        <div>
                          <p className="text-xs text-purple-500">Shipped On</p>
                          <p className="mt-1 text-xs font-bold text-purple-900">
                            {formatDateTime(order.shippedAt)}
                          </p>
                        </div>
                      )}
                      {order.deliveredAt && (
                        <div>
                          <p className="text-xs text-purple-500">Delivered On</p>
                          <p className="mt-1 text-xs font-bold text-purple-900">
                            {formatDateTime(order.deliveredAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {order.orderStatus ===
                "Shipped" &&
                !order.trackingNumber && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <div className="flex gap-3">

                      <Icon
                        path={
                          mdiAlertCircleOutline
                        }
                        size={0.8}
                        className="flex-shrink-0 text-amber-600"
                      />

                      <div>

                        <p className="text-sm font-bold text-amber-800">
                          Tracking information not added
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          The order has been shipped,
                          but a tracking number has not
                          been added yet.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

            </section>

          </div>

          {/* =================================================
              RIGHT COLUMN
              ================================================= */}

          <div className="space-y-6">

            {/* =================================================
                ORDER SUMMARY
                ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="font-bold text-slate-900">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-start gap-3">

                  <Icon
                    path={mdiIdentifier}
                    size={0.8}
                    className="mt-0.5 text-slate-400"
                  />

                  <div>

                    <p className="text-xs text-slate-400">
                      Order ID
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {order._id}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <Icon
                    path={mdiCalendarOutline}
                    size={0.8}
                    className="mt-0.5 text-slate-400"
                  />

                  <div>

                    <p className="text-xs text-slate-400">
                      Order Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDateTime(
                        order.createdAt
                      )}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <Icon
                    path={
                      mdiTruckDeliveryOutline
                    }
                    size={0.8}
                    className="mt-0.5 text-slate-400"
                  />

                  <div>

                    <p className="text-xs text-slate-400">
                      Delivery Type
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {order.deliveryType}
                    </p>

                  </div>

                </div>

                {order.estimatedDeliveryDate && (
                  <div className="flex items-start gap-3">

                    <Icon
                      path={
                        mdiCalendarOutline
                      }
                      size={0.8}
                      className="mt-0.5 text-slate-400"
                    />

                    <div>

                      <p className="text-xs text-slate-400">
                        Estimated Delivery
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDate(
                          order.estimatedDeliveryDate
                        )}
                      </p>

                    </div>

                  </div>
                )}

              </div>

            </section>

            {/* =================================================
                PAYMENT
                ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">

                  <Icon
                    path={
                      mdiCreditCardOutline
                    }
                    size={0.9}
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Payment
                  </h2>

                  <p className="text-xs text-slate-500">
                    Payment information
                  </p>

                </div>

              </div>

              <div className="mt-5 space-y-4">

                <div className="flex justify-between gap-4">

                  <span className="text-sm text-slate-500">
                    Method
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {order.paymentMethod}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${getPaymentStyle(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>

                </div>

                <div className="flex justify-between gap-4 border-t border-slate-100 pt-4">

                  <span className="text-sm font-bold text-slate-700">
                    Total
                  </span>

                  <span className="text-lg font-black text-[#57213f]">
                    ₹
                    {Number(
                      order.totalPrice
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

            </section>

            {/* =================================================
                PAYMENT TRANSACTION
                ================================================= */}

            {order.paymentInfo && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="font-bold text-slate-900">
                  Payment Details
                </h2>

                <div className="mt-5 space-y-4">

                  {order.paymentInfo
                    .razorpayOrderId && (
                    <div>

                      <p className="text-xs text-slate-400">
                        Razorpay Order ID
                      </p>

                      <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                        {
                          order.paymentInfo
                            .razorpayOrderId
                        }
                      </p>

                    </div>
                  )}

                  {order.paymentInfo
                    .razorpayPaymentId && (
                    <div>

                      <p className="text-xs text-slate-400">
                        Razorpay Payment ID
                      </p>

                      <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                        {
                          order.paymentInfo
                            .razorpayPaymentId
                        }
                      </p>

                    </div>
                  )}

                  {order.paymentInfo
                    .transactionId && (
                    <div>

                      <p className="text-xs text-slate-400">
                        Transaction ID
                      </p>

                      <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                        {
                          order.paymentInfo
                            .transactionId
                        }
                      </p>

                    </div>
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                TRACKING CARD
                ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                  <Icon
                    path={
                      mdiTruckDeliveryOutline
                    }
                    size={0.9}
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Tracking
                  </h2>

                  <p className="text-xs text-slate-500">
                    Shipment information
                  </p>

                </div>

              </div>

              <div className="mt-5 space-y-4">

                {order.courierName && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Courier
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {order.courierName}
                    </p>
                  </div>
                )}

                {order.trackingNumber ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tracking Number
                    </p>
                    <p className="mt-2 break-all rounded-xl bg-slate-50 p-3 text-sm font-black text-slate-800">
                      {order.trackingNumber}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      No tracking number
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Tracking information can be added when the order is shipped.
                    </p>
                  </div>
                )}

                {order.shippedAt && (
                  <div>
                    <p className="text-xs text-slate-400">Shipped On</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDateTime(order.shippedAt)}
                    </p>
                  </div>
                )}

                {order.deliveredAt && (
                  <div>
                    <p className="text-xs text-slate-400">Delivered On</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDateTime(order.deliveredAt)}
                    </p>
                  </div>
                )}

                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#57213f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#451931]"
                  >
                    <Icon path={mdiLinkVariant} size={0.7} />
                    Track Shipment
                  </a>
                )}

              </div>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}