"use client";

import { useEffect, useState } from "react";
import {
  getAdminNotifications,
  markNotificationAsRead,
  Notification,
} from "../../../services/notification.service";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminNotifications();

      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const updatedNotification =
        await markNotificationAsRead(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === updatedNotification._id
            ? updatedNotification
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your store notifications
            </p>
          </div>

          <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
            <span className="text-sm text-slate-500">
              Unread
            </span>

            <span className="ml-2 font-semibold text-slate-900">
              {unreadCount}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading notifications...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={loadNotifications}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">🔔</div>

            <h2 className="mt-3 text-lg font-semibold text-slate-800">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              You don't have any notifications yet.
            </p>
          </div>
        )}

        {/* Notifications */}
        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                  notification.isRead
                    ? "border-slate-200"
                    : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      notification.isRead
                        ? "bg-slate-100"
                        : "bg-blue-100"
                    }`}
                  >
                    <span className="text-xl">
                      {notification.type === "ORDER_CREATED"
                        ? "🛒"
                        : "🔔"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-slate-900">
                            {notification.title}
                          </h2>

                          {!notification.isRead && (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-600">
                          {notification.message}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-slate-400">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    {/* Order information */}
                    {notification.orderId && (
                      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-xs text-slate-500">
                          Order ID
                        </span>

                        <p className="mt-1 break-all font-mono text-xs text-slate-700">
                          {notification.orderId}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {!notification.isRead && (
                      <div className="mt-4">
                        <button
                          onClick={() =>
                            handleMarkAsRead(notification._id)
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}