"use client";

import { useEffect } from "react";

type NotificationType = "success" | "error" | "warning" | "info";

type NotificationProps = {
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
};

const notificationStyles = {
  success: {
    icon: "✓",
    iconClass: "bg-green-500 text-white",
    borderClass: "border-green-500",
    progressClass: "bg-green-500",
  },

  error: {
    icon: "×",
    iconClass: "bg-red-500 text-white",
    borderClass: "border-red-500",
    progressClass: "bg-red-500",
  },

  warning: {
    icon: "!",
    iconClass: "bg-yellow-500 text-white",
    borderClass: "border-yellow-500",
    progressClass: "bg-yellow-500",
  },

  info: {
    icon: "i",
    iconClass: "bg-blue-500 text-white",
    borderClass: "border-blue-500",
    progressClass: "bg-blue-500",
  },
};

export default function Notification({
  type,
  title,
  message,
  onClose,
}: NotificationProps) {
  const style = notificationStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed right-6 top-6 z-50 w-[380px] overflow-hidden rounded-2xl border border-gray-100 border-l-4 bg-white shadow-xl ${style.borderClass}`}
    >
      <div className="flex items-start gap-4 p-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold ${style.iconClass}`}
        >
          {style.icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#261923]">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-5 text-gray-500">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-2xl leading-none text-gray-400 transition-colors hover:text-gray-700"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>

      <div className="mx-5 mb-4 h-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full w-full origin-left animate-[notificationProgress_3s_linear_forwards] ${style.progressClass}`}
        />
      </div>
    </div>
  );
}