"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@mdi/react";

import {
  mdiMagnify,
  mdiRefresh,
  mdiEyeOutline,
  mdiPackageVariant,
  mdiChevronDown,
  mdiClose,
  mdiTruckDeliveryOutline,
  mdiCheckCircleOutline,
  mdiAlertCircleOutline,
  mdiClockOutline,
} from "@mdi/js";

import {
  getAllOrders,
  updateOrderStatus,
} from "../../../services/order.service";

import type {
  Order,
  OrderStatus,
} from "../../../services/order.service";

import Notification from "../../../components/notification/Notification";

type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

const orderStatuses: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  // =====================================================
  // ORDERS
  // =====================================================

  const [orders, setOrders] = useState<Order[]>([]);

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // STATUS UPDATE
  // =====================================================

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  // =====================================================
  // CANCEL MODAL
  // =====================================================

  const [cancelOrder, setCancelOrder] =
    useState<Order | null>(null);

  const [cancellationReason, setCancellationReason] =
    useState("");

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [notification, setNotification] = useState<{
    type: NotificationType;
    title: string;
    message: string;
  } | null>(null);

  // =====================================================
  // SHOW NOTIFICATION
  // =====================================================

  const showMessage = (
    type: NotificationType,
    title: string,
    message: string
  ) => {
    setNotification({
      type,
      title,
      message,
    });
  };

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllOrders();

      setOrders(data);
    } catch (error) {
      console.error(
        "Admin orders error:",
        error
      );

      setError(
        "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredOrders = useMemo(() => {
    const searchTerm =
      search.toLowerCase().trim();

    if (!searchTerm) {
      return orders;
    }

    return orders.filter((order) => {
      const orderId =
        order._id?.toLowerCase() || "";

      const customerName =
        order.shippingAddress?.fullName
          ?.toLowerCase() || "";

      const customerEmail =
        order.shippingAddress?.email
          ?.toLowerCase() || "";

      const customerPhone =
        order.shippingAddress?.phone
          ?.toLowerCase() || "";

      const productNames =
        order.orderItems
          ?.map(
            (item) =>
              item.title?.toLowerCase() || ""
          )
          .join(" ") || "";

      return (
        orderId.includes(searchTerm) ||
        customerName.includes(searchTerm) ||
        customerEmail.includes(searchTerm) ||
        customerPhone.includes(searchTerm) ||
        productNames.includes(searchTerm)
      );
    });
  }, [orders, search]);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusChange = async (
    order: Order,
    newStatus: OrderStatus
  ) => {
    if (!order._id) return;

    // No change
    if (newStatus === order.orderStatus) {
      return;
    }

    // ===================================================
    // CANCEL REQUIRES REASON
    // ===================================================

    if (newStatus === "Cancelled") {
      setCancelOrder(order);

      setCancellationReason(
        order.cancellationReason || ""
      );

      return;
    }

    // Save previous status
    const previousStatus = order.orderStatus;

    // ===================================================
    // UPDATE UI IMMEDIATELY
    // ===================================================

    setOrders((currentOrders) =>
      currentOrders.map((item) =>
        item._id === order._id
          ? {
              ...item,
              orderStatus: newStatus,
            }
          : item
      )
    );

    try {
      setUpdatingOrderId(order._id);

      console.log(
        "Updating order status:",
        order._id,
        newStatus
      );

      const updatedOrder =
        await updateOrderStatus(
          order._id,
          newStatus
        );

      console.log(
        "Order status updated:",
        updatedOrder
      );

      // =================================================
      // USE BACKEND RESPONSE
      // =================================================

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item._id === order._id
            ? updatedOrder
            : item
        )
      );

      showMessage(
        "success",
        "Order Status Updated",
        `Order #${order._id.slice(
          -8
        )} is now ${newStatus}.`
      );
    } catch (error: any) {
      console.error(
        "Update order status error:",
        error
      );

      // =================================================
      // RESTORE PREVIOUS STATUS
      // =================================================

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item._id === order._id
            ? {
                ...item,
                orderStatus: previousStatus,
              }
            : item
        )
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update the order status.";

      showMessage(
        "error",
        "Status Update Failed",
        errorMessage
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =====================================================
  // CONFIRM CANCELLATION
  // =====================================================

  const handleConfirmCancellation = async () => {
    if (!cancelOrder?._id) return;

    if (!cancellationReason.trim()) {
      showMessage(
        "warning",
        "Cancellation Reason Required",
        "Please enter a reason for cancelling this order."
      );

      return;
    }

    try {
      setUpdatingOrderId(
        cancelOrder._id
      );

      const updatedOrder =
        await updateOrderStatus(
          cancelOrder._id,
          "Cancelled",
          cancellationReason.trim()
        );

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item._id === cancelOrder._id
            ? updatedOrder
            : item
        )
      );

      showMessage(
        "success",
        "Order Cancelled",
        `Order #${cancelOrder._id.slice(
          -8
        )} has been cancelled.`
      );

      setCancelOrder(null);
      setCancellationReason("");
    } catch (error: any) {
      console.error(
        "Cancel order error:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to cancel the order.";

      showMessage(
        "error",
        "Cancellation Failed",
        errorMessage
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

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
  // FORMAT TIME
  // =====================================================

  const formatTime = (
    date?: string
  ) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // STATUS STYLES
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
  // PAYMENT STYLES
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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#57213f]" />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading orders...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">

      {/* =================================================
          NOTIFICATION
          ================================================= */}

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() =>
            setNotification(null)
          }
        />
      )}

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-black text-[#57213f]">
              Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer orders and delivery status
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#57213f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#713052] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              path={mdiRefresh}
              size={0.75}
            />

            Refresh Orders
          </button>

        </div>

        {/* =================================================
            SEARCH + SUMMARY
            ================================================= */}

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">

          {/* SEARCH */}

          <div className="relative">

            <Icon
              path={mdiMagnify}
              size={0.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search order ID, customer, email, phone or product..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none focus:border-[#c87965] focus:ring-2 focus:ring-[#c87965]/10"
            />

          </div>

          {/* ORDER COUNT */}

          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3">

            <span className="text-sm text-slate-500">
              Showing
            </span>

            <span className="mx-1.5 text-lg font-black text-[#57213f]">
              {filteredOrders.length}
            </span>

            <span className="text-sm text-slate-500">
              of {orders.length} orders
            </span>

          </div>

        </div>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white p-6 text-center">

            <p className="font-semibold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchOrders}
              className="mt-4 rounded-lg bg-[#57213f] px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>

          </div>
        )}

        {/* =================================================
            ORDERS TABLE
            ================================================= */}

        {!error && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* =================================================
                DESKTOP
                ================================================= */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => {

                      const statusStyle =
                        getStatusStyle(
                          order.orderStatus
                        );

                      const customerName =
                        order.shippingAddress
                          ?.fullName ||
                        "Unknown Customer";

                      const paymentStatus =
                        order.paymentStatus ||
                        "Pending";

                      return (
                        <tr
                          key={order._id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >

                          {/* ORDER */}

                          <td className="px-5 py-4">

                            <div>

                              <p className="font-bold text-slate-900">
                                #
                                {order._id
                                  .slice(-8)
                                  .toUpperCase()}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {order.orderItems?.length || 0}{" "}
                                {order.orderItems?.length === 1
                                  ? "item"
                                  : "items"}
                              </p>

                            </div>

                          </td>

                          {/* CUSTOMER */}

                          <td className="px-5 py-4">

                            <div>

                              <p className="font-semibold text-slate-900">
                                {customerName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {order.shippingAddress?.email ||
                                  "-"}
                              </p>

                            </div>

                          </td>

                          {/* DATE */}

                          <td className="px-5 py-4">

                            <p className="text-sm font-semibold text-slate-700">
                              {formatDate(
                                order.createdAt
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatTime(
                                order.createdAt
                              )}
                            </p>

                          </td>

                          {/* AMOUNT */}

                          <td className="px-5 py-4">

                            <p className="font-black text-slate-900">
                              ₹
                              {Number(
                                order.totalPrice || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {order.paymentMethod}
                            </p>

                          </td>

                          {/* PAYMENT */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getPaymentStyle(
                                paymentStatus
                              )}`}
                            >
                              {paymentStatus}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <div className="relative">

                              <select
                                value={order.orderStatus}
                                onChange={(event) => {
                                  const newStatus =
                                    event.target.value as OrderStatus;

                                  console.log(
                                    "Status changed:",
                                    order.orderStatus,
                                    "→",
                                    newStatus
                                  );

                                  handleStatusChange(
                                    order,
                                    newStatus
                                  );
                                }}
                                disabled={
                                  updatingOrderId ===
                                  order._id
                                }
                                className={`cursor-pointer appearance-none rounded-full border py-2 pl-3 pr-8 text-xs font-bold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${statusStyle.className}`}
                              >

                                {orderStatuses.map(
                                  (status) => (
                                    <option
                                      key={status}
                                      value={status}
                                    >
                                      {status}
                                    </option>
                                  )
                                )}

                              </select>

                              <Icon
                                path={
                                  mdiChevronDown
                                }
                                size={0.55}
                                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                              />

                            </div>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end">

                              <Link
                                href={`/admin/orders/${order._id}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                                title="View Order"
                              >
                                <Icon
                                  path={
                                    mdiEyeOutline
                                  }
                                  size={0.7}
                                />
                              </Link>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE
                ================================================= */}

            <div className="divide-y divide-slate-100 md:hidden">

              {filteredOrders.map(
                (order) => {

                  const statusStyle =
                    getStatusStyle(
                      order.orderStatus
                    );

                  const customerName =
                    order.shippingAddress
                      ?.fullName ||
                    "Unknown Customer";

                  return (
                    <div
                      key={order._id}
                      className="p-4"
                    >

                      {/* HEADER */}

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <p className="font-bold text-slate-900">
                            #
                            {order._id
                              .slice(-8)
                              .toUpperCase()}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              order.createdAt
                            )}
                          </p>

                        </div>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyle.className}`}
                        >
                          {order.orderStatus}
                        </span>

                      </div>

                      {/* CUSTOMER */}

                      <div className="mt-4">

                        <p className="font-semibold text-slate-900">
                          {customerName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {order.shippingAddress?.email ||
                            "-"}
                        </p>

                      </div>

                      {/* SUMMARY */}

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">

                        <div>

                          <p className="text-xs text-slate-400">
                            Total
                          </p>

                          <p className="mt-1 font-black text-slate-900">
                            ₹
                            {Number(
                              order.totalPrice || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-slate-400">
                            Payment
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {order.paymentMethod}
                          </p>

                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="mt-4">

                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Order Status
                        </label>

                        <div className="relative">

                          <select
                            value={order.orderStatus}
                            onChange={(event) => {
                              const newStatus =
                                event.target.value as OrderStatus;

                              console.log(
                                "Mobile status changed:",
                                order.orderStatus,
                                "→",
                                newStatus
                              );

                              handleStatusChange(
                                order,
                                newStatus
                              );
                            }}
                            disabled={
                              updatingOrderId ===
                              order._id
                            }
                            className={`w-full cursor-pointer appearance-none rounded-xl border py-3 pl-4 pr-10 text-sm font-bold outline-none disabled:cursor-not-allowed disabled:opacity-60 ${statusStyle.className}`}
                          >

                            {orderStatuses.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              )
                            )}

                          </select>

                          <Icon
                            path={
                              mdiChevronDown
                            }
                            size={0.65}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                          />

                        </div>

                      </div>

                      {/* VIEW */}

                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#57213f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#713052]"
                      >

                        <Icon
                          path={mdiEyeOutline}
                          size={0.75}
                        />

                        View Order

                      </Link>

                    </div>
                  );
                }
              )}

            </div>

            {/* =================================================
                EMPTY
                ================================================= */}

            {filteredOrders.length === 0 && (
              <div className="px-6 py-16 text-center">

                <Icon
                  path={mdiPackageVariant}
                  size={2}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  No orders found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try another search term."
                    : "There are no orders yet."}
                </p>

              </div>
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          CANCELLATION MODAL
          ===================================================== */}

      {cancelOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-slate-100 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">

                  <Icon
                    path={
                      mdiAlertCircleOutline
                    }
                    size={1}
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Cancel Order?
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Order #
                    {cancelOrder._id
                      .slice(-8)
                      .toUpperCase()}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setCancelOrder(null);
                  setCancellationReason("");
                }}
                disabled={
                  updatingOrderId ===
                  cancelOrder._id
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >

                <Icon
                  path={mdiClose}
                  size={0.8}
                />

              </button>

            </div>

            {/* BODY */}

            <div className="p-6">

              <p className="text-sm leading-6 text-slate-600">
                Please provide a reason for cancelling
                this order.
              </p>

              <textarea
                value={cancellationReason}
                onChange={(event) =>
                  setCancellationReason(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Enter cancellation reason..."
                disabled={
                  updatingOrderId ===
                  cancelOrder._id
                }
                className="mt-4 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:bg-slate-50"
              />

            </div>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => {
                  setCancelOrder(null);
                  setCancellationReason("");
                }}
                disabled={
                  updatingOrderId ===
                  cancelOrder._id
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmCancellation
                }
                disabled={
                  updatingOrderId ===
                  cancelOrder._id
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {updatingOrderId ===
                cancelOrder._id ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Cancelling...
                  </>
                ) : (
                  <>
                    <Icon
                      path={
                        mdiAlertCircleOutline
                      }
                      size={0.75}
                    />

                    Confirm Cancellation
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}