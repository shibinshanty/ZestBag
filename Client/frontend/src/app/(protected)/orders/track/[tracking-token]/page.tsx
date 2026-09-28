"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  trackOrder,
  type OrderTracking,
  type OrderStatus,
} from "../../../../../services/order.service";

export default function TrackOrderPage() {
  const params = useParams();

  const trackingToken = Array.isArray(params["tracking-token"])
    ? params["tracking-token"][0]
    : params["tracking-token"];

  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD TRACKING INFORMATION
  // =====================================================

  useEffect(() => {
    const loadTracking = async () => {
      if (!trackingToken) {
        setError("Tracking token is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await trackOrder(trackingToken);

        setTracking(data);
      } catch (error: any) {
        console.error("Tracking error:", error);

        setError(
          error?.response?.data?.message ||
            "Unable to find tracking information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTracking();
  }, [trackingToken]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date?: string | null,
  ) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  // =====================================================
  // FORMAT DATE + TIME
  // =====================================================

  const formatDateTime = (
    date?: string | null,
  ) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  // =====================================================
  // STATUS HELPERS
  // =====================================================

  const getStatusIndex = (
    status: OrderStatus,
  ) => {
    switch (status) {
      case "Pending":
        return 0;

      case "Processing":
        return 1;

      case "Shipped":
        return 2;

      case "Delivered":
        return 4;

      case "Cancelled":
        return -1;

      default:
        return 0;
    }
  };

  const currentStatusIndex = tracking
    ? getStatusIndex(tracking.orderStatus)
    : 0;

  const isCancelled =
    tracking?.orderStatus === "Cancelled";

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (
    status: OrderStatus,
  ) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "Processing":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "Shipped":
        return "bg-purple-100 text-purple-700 border-purple-200";

      case "Delivered":
        return "bg-green-100 text-green-700 border-green-200";

      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff8f3] px-4 py-10">
        <div className="mx-auto max-w-4xl">

          <div className="animate-pulse">

            <div className="mx-auto h-4 w-32 rounded bg-[#ead6ce]" />

            <div className="mx-auto mt-4 h-10 w-64 rounded bg-[#ead6ce]" />

            <div className="mx-auto mt-3 h-4 w-80 max-w-full rounded bg-[#ead6ce]" />

            <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-sm">

              <div className="h-6 w-40 rounded bg-[#ead6ce]" />

              <div className="mt-6 h-20 rounded-xl bg-[#f7eee9]" />

              <div className="mt-8 h-48 rounded-xl bg-[#f7eee9]" />

            </div>

          </div>

        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !tracking) {
    return (
      <main className="min-h-screen bg-[#fff8f3] px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">

          <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
              !
            </div>

            <h1 className="mt-6 text-2xl font-black text-[#4a1d3f]">
              Tracking Information Not Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error ||
                "We could not find an order associated with this tracking link."}
            </p>

            <p className="mt-4 break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-400">
              Tracking token:{" "}
              {trackingToken || "Not available"}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-[#4a1d3f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c87965]"
            >
              Try Again
            </button>

          </div>

        </div>
      </main>
    );
  }

  // =====================================================
  // TRACKING PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#fff8f3] px-4 py-8 sm:px-6 lg:px-10">

      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c87965]">
            Order Tracking
          </p>

          <h1 className="mt-2 text-3xl font-black text-[#4a1d3f] sm:text-4xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Follow the latest status and delivery information
            for your order.
          </p>

        </div>

        {/* =================================================
            ORDER SUMMARY
            ================================================= */}

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Order Number
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#4a1d3f]">
                {tracking.orderNumber}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                Order placed on{" "}
                {formatDateTime(tracking.createdAt)}
              </p>

            </div>

            <div
              className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${getStatusStyle(
                tracking.orderStatus,
              )}`}
            >
              {tracking.orderStatus}
            </div>

          </div>

        </section>

        {/* =================================================
            CANCELLED ORDER
            ================================================= */}

        {isCancelled ? (
          <section className="mt-6 rounded-[2rem] border border-red-200 bg-red-50 p-6 sm:p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
                !
              </div>

              <div>
                <h2 className="font-black text-red-800">
                  Order Cancelled
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  This order has been cancelled.
                </p>
              </div>

            </div>

          </section>
        ) : (
          <>
            {/* =================================================
                TRACKING TIMELINE
                ================================================= */}

            <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">

              <h2 className="text-xl font-black text-[#4a1d3f]">
                Shipment Progress
              </h2>

              <div className="mt-8">

                {/* ORDER PLACED */}

                <TrackingStep
                  title="Order Placed"
                  description="Your order has been successfully placed."
                  completed={currentStatusIndex >= 0}
                  active={currentStatusIndex === 0}
                  date={
                    currentStatusIndex >= 0
                      ? formatDateTime(
                          tracking.createdAt,
                        )
                      : undefined
                  }
                  isLast={false}
                />

                {/* PROCESSING */}

                <TrackingStep
                  title="Processing"
                  description="Your order is being prepared."
                  completed={currentStatusIndex >= 1}
                  active={currentStatusIndex === 1}
                  isLast={false}
                />

                {/* SHIPPED */}

                <TrackingStep
                  title="Shipped"
                  description={
                    tracking.courierName
                      ? `Your order has been handed over to ${tracking.courierName}.`
                      : "Your order has been shipped."
                  }
                  completed={currentStatusIndex >= 2}
                  active={currentStatusIndex === 2}
                  date={
                    tracking.shippedAt
                      ? formatDateTime(
                          tracking.shippedAt,
                        )
                      : undefined
                  }
                  isLast={false}
                />

                {/* OUT FOR DELIVERY */}

                <TrackingStep
                  title="Out for Delivery"
                  description="Your package is on the way to you."
                  completed={
                    currentStatusIndex >= 4 ||
                    !!tracking.outForDeliveryAt
                  }
                  active={
                    !!tracking.outForDeliveryAt &&
                    currentStatusIndex < 4
                  }
                  date={
                    tracking.outForDeliveryAt
                      ? formatDateTime(
                          tracking.outForDeliveryAt,
                        )
                      : undefined
                  }
                  isLast={false}
                />

                {/* DELIVERED */}

                <TrackingStep
                  title="Delivered"
                  description="Your order has been delivered successfully."
                  completed={
                    tracking.orderStatus ===
                    "Delivered"
                  }
                  active={
                    tracking.orderStatus ===
                    "Delivered"
                  }
                  date={
                    tracking.deliveredAt
                      ? formatDateTime(
                          tracking.deliveredAt,
                        )
                      : undefined
                  }
                  isLast={true}
                />

              </div>

            </section>

            {/* =================================================
                COURIER DETAILS
                ================================================= */}

            <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">

              <h2 className="text-xl font-black text-[#4a1d3f]">
                Delivery Information
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {/* Courier */}

                <InfoCard
                  label="Courier"
                  value={
                    tracking.courierName ||
                    "Not assigned yet"
                  }
                />

                {/* Tracking Number */}

                <InfoCard
                  label="Tracking Number"
                  value={
                    tracking.trackingNumber ||
                    "Not available yet"
                  }
                />

                {/* Estimated Delivery */}

                <InfoCard
                  label="Estimated Delivery"
                  value={formatDate(
                    tracking.estimatedDeliveryDate,
                  )}
                />

                {/* Shipped Date */}

                <InfoCard
                  label="Shipped On"
                  value={
                    tracking.shippedAt
                      ? formatDate(
                          tracking.shippedAt,
                        )
                      : "Not shipped yet"
                  }
                />

              </div>

              {/* Courier Tracking Link */}

              {tracking.trackingNumber && (
                <div className="mt-6 rounded-2xl bg-[#fff8f3] p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Shipment Tracking
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your shipment has a tracking number
                    assigned by the courier.
                  </p>

                </div>
              )}

            </section>

            {/* =================================================
                DELIVERY DATES
                ================================================= */}

            <section className="mt-6 grid gap-6 sm:grid-cols-3">

              <DateCard
                title="Order Placed"
                date={tracking.createdAt}
              />

              <DateCard
                title="Estimated Delivery"
                date={tracking.estimatedDeliveryDate}
              />

              <DateCard
                title="Delivered"
                date={tracking.deliveredAt}
              />

            </section>
          </>
        )}

        {/* =================================================
            REFRESH BUTTON
            ================================================= */}

        <div className="mt-8 flex justify-center">

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-[#ead6ce] bg-white px-6 py-3 text-sm font-bold text-[#4a1d3f] shadow-sm transition hover:bg-[#fff4ed]"
          >
            Refresh Tracking
          </button>

        </div>

        {/* =================================================
            SECURITY NOTE
            ================================================= */}

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-slate-400">
          This tracking page uses a unique tracking link for
          this order. Sensitive payment and delivery-address
          information is not displayed here.
        </p>

      </div>
    </main>
  );
}

// =====================================================
// TRACKING STEP COMPONENT
// =====================================================

interface TrackingStepProps {
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  date?: string;
  isLast: boolean;
}

function TrackingStep({
  title,
  description,
  completed,
  active,
  date,
  isLast,
}: TrackingStepProps) {
  return (
    <div className="relative flex gap-4">

      {/* Vertical Line */}

      {!isLast && (
        <div
          className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-[2px] ${
            completed
              ? "bg-[#c87965]"
              : "bg-slate-200"
          }`}
        />
      )}

      {/* Circle */}

      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black ${
          completed
            ? "border-[#c87965] bg-[#c87965] text-white"
            : active
              ? "border-[#4a1d3f] bg-white text-[#4a1d3f]"
              : "border-slate-200 bg-white text-slate-300"
        }`}
      >
        {completed ? "✓" : ""}
      </div>

      {/* Content */}

      <div className="min-h-[105px] flex-1 pb-5">

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

          <h3
            className={`font-black ${
              completed || active
                ? "text-[#4a1d3f]"
                : "text-slate-400"
            }`}
          >
            {title}
          </h3>

          {date && (
            <span className="text-xs font-semibold text-slate-400">
              {date}
            </span>
          )}

        </div>

        <p
          className={`mt-1 text-sm leading-6 ${
            completed || active
              ? "text-slate-500"
              : "text-slate-300"
          }`}
        >
          {description}
        </p>

      </div>
    </div>
  );
}

// =====================================================
// INFO CARD
// =====================================================

interface InfoCardProps {
  label: string;
  value: string;
}

function InfoCard({
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

// =====================================================
// DATE CARD
// =====================================================

interface DateCardProps {
  title: string;
  date?: string | null;
}

function DateCard({
  title,
  date,
}: DateCardProps) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 font-black text-[#4a1d3f]">
        {date
          ? new Date(date).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              },
            )
          : "Not available"}
      </p>

    </div>
  );
}