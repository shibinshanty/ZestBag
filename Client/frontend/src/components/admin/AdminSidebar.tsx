"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  mdiViewDashboardOutline,
  mdiPackageVariantClosed,
  mdiCartOutline,
  mdiAccountGroupOutline,
  mdiBellOutline,
  mdiLogout,
  mdiStorefrontOutline,
} from "@mdi/js";

import Icon from "@mdi/react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: mdiViewDashboardOutline,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: mdiPackageVariantClosed,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: mdiCartOutline,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: mdiAccountGroupOutline,
  },
  {
    name: "Notifications",
    href: "/admin/notification",
    icon: mdiBellOutline,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/admin/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white md:block">
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
            <Icon
              path={mdiStorefrontOutline}
              size={0.9}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Admin Panel
            </h1>

            <p className="text-xs text-slate-500">
              Store Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon path={item.icon} size={0.9} />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Icon path={mdiLogout} size={0.9} />

            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}