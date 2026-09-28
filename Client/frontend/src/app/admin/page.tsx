"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Icon from "@mdi/react";

import {
  mdiBellOutline,
  mdiCurrencyInr,
  mdiCartOutline,
  mdiAccountMultipleOutline,
  mdiAlertCircleOutline,
  mdiPackageVariantClosed,
  mdiArrowRight,
  mdiCheckCircleOutline,
  mdiClockOutline,
} from "@mdi/js";

import {
  getCustomerDashboard,
  getProductDashboard,
  getOrderDashboard,
  getAdminUsers,
  type CustomerDashboard,
  type ProductDashboard,
  type OrderDashboard,
  type AdminUser,
} from "../../services/admin.service";

type LoggedInAdmin = {
  name?: string;
  email?: string;
  role?: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  // ========================================
  // ADMIN AUTH STATE
  // ========================================

  const [admin, setAdmin] = useState<LoggedInAdmin | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ========================================
  // DASHBOARD STATE
  // ========================================

  const [customerDashboard, setCustomerDashboard] =
    useState<CustomerDashboard | null>(null);

  const [productDashboard, setProductDashboard] =
    useState<ProductDashboard | null>(null);

  const [orderDashboard, setOrderDashboard] =
    useState<OrderDashboard | null>(null);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  // ========================================
  // CHECK ADMIN AUTHENTICATION
  // ========================================

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        router.replace("/admin/login");
        return;
      }

      const parsedUser: LoggedInAdmin = JSON.parse(storedUser);

      if (parsedUser.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/admin/login");
        return;
      }

      setAdmin(parsedUser);
    } catch (error) {
      console.error("Admin authentication error:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.replace("/admin/login");
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  // ========================================
  // LOAD DASHBOARD DATA
  // ========================================

  useEffect(() => {
    if (!admin) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError("");

        const [
          customerData,
          productData,
          orderData,
          usersData,
        ] = await Promise.all([
          getCustomerDashboard(),
          getProductDashboard(),
          getOrderDashboard(),
          getAdminUsers(),
        ]);

        setCustomerDashboard(customerData);
        setProductDashboard(productData);
        setOrderDashboard(orderData);
        setAdminUsers(usersData);
      } catch (error) {
        console.error("Admin dashboard loading error:", error);

        setDashboardError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDashboard();
  }, [admin]);

  // ========================================
  // AUTH LOADING
  // ========================================

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead6ce] border-t-[#57213f]" />

          <p className="mt-4 text-sm font-semibold text-[#805f68]">
            Checking admin access...
          </p>
        </div>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  // ========================================
  // DASHBOARD VALUES
  // ========================================

  const totalSales = orderDashboard?.totalSales ?? 0;

  const totalOrders = orderDashboard?.totalOrders ?? 0;

  const totalCustomers =
    customerDashboard?.totalCustomers ?? 0;

  const totalProducts =
    productDashboard?.totalProducts ?? 0;

  const lowStockProducts =
    productDashboard?.lowStockProducts ?? 0;

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#57213f]">

      {/* ========================================
          DASHBOARD HEADER
      ======================================== */}

      <header className="sticky top-0 z-30 border-b border-[#f0ded5] bg-[#fffaf5]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#c87965]">
              Admin Dashboard
            </p>

            <h1 className="text-xl font-black text-[#57213f] sm:text-2xl">
              Welcome, {admin.name || "Admin"} 👋
            </h1>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/notification")}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ead6ce] bg-white text-[#57213f] shadow-sm transition hover:border-[#c87965]"
          >
            <Icon path={mdiBellOutline} size={0.95} />

            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e87551] px-1 text-[10px] font-black text-white">
              
            </span>
          </button>

        </div>
      </header>

      {/* ========================================
          DASHBOARD CONTENT
      ======================================== */}

      <div className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* ========================================
              DASHBOARD ERROR
          ======================================== */}

          {dashboardError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {dashboardError}
            </div>
          )}

          {/* ========================================
              STATISTICS
          ======================================== */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL SALES */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-[#f0ded5] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-semibold text-[#805f68]">
                    Total Sales
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#57213f]">
                    {loadingDashboard
                      ? "..."
                      : `₹${totalSales.toLocaleString("en-IN")}`}
                  </h2>

                  <p className="mt-2 text-xs font-medium text-[#9b7b83]">
                    Completed payments
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#57213f]">
                  <Icon path={mdiCurrencyInr} size={1} />
                </div>

              </div>
            </motion.div>

            {/* TOTAL ORDERS */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-[#f0ded5] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-semibold text-[#805f68]">
                    Orders
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#57213f]">
                    {loadingDashboard ? "..." : totalOrders}
                  </h2>

                  <p className="mt-2 text-xs font-medium text-[#9b7b83]">
                    Total orders
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#57213f]">
                  <Icon path={mdiCartOutline} size={1} />
                </div>

              </div>
            </motion.div>

            {/* CUSTOMERS */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-[#f0ded5] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-semibold text-[#805f68]">
                    Customers
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#57213f]">
                    {loadingDashboard
                      ? "..."
                      : totalCustomers}
                  </h2>

                  <p className="mt-2 text-xs font-medium text-[#9b7b83]">
                    Registered users
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#57213f]">
                  <Icon
                    path={mdiAccountMultipleOutline}
                    size={1}
                  />
                </div>

              </div>
            </motion.div>

            {/* PRODUCTS */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="rounded-3xl border border-[#f0ded5] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-semibold text-[#805f68]">
                    Products
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#57213f]">
                    {loadingDashboard
                      ? "..."
                      : totalProducts}
                  </h2>

                  <p className="mt-2 text-xs font-medium text-[#9b7b83]">
                    Products in store
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#57213f]">
                  <Icon
                    path={mdiPackageVariantClosed}
                    size={1}
                  />
                </div>

              </div>
            </motion.div>

          </div>

          {/* ========================================
              RECENT CUSTOMERS
          ======================================== */}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 rounded-3xl border border-[#f0ded5] bg-white p-6 shadow-sm"
          >

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-black text-[#57213f]">
                  Recent Customers
                </h2>

                <p className="mt-1 text-sm text-[#805f68]">
                  Recently registered customers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/admin/users")}
                className="flex items-center gap-2 rounded-xl border border-[#ead6ce] px-4 py-2 text-xs font-bold text-[#57213f] transition hover:border-[#c87965] hover:bg-[#fffaf5]"
              >
                View All

                <Icon
                  path={mdiArrowRight}
                  size={0.7}
                />
              </button>

            </div>

            {/* LOADING */}

            {loadingDashboard ? (
              <div className="py-8 text-center text-sm font-semibold text-[#805f68]">
                Loading customers...
              </div>
            ) : adminUsers.length === 0 ? (

              /* NO CUSTOMERS */

              <div className="py-8 text-center text-sm font-semibold text-[#805f68]">
                No customers found.
              </div>

            ) : (

              /* CUSTOMER TABLE */

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead>
                    <tr className="border-b border-[#f0ded5] text-left">

                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Customer
                      </th>

                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Email
                      </th>

                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Membership
                      </th>

                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {adminUsers
                      .slice(0, 5)
                      .map((user) => (

                        <tr
                          key={user._id}
                          className="border-b border-[#f7ebe5] last:border-0"
                        >

                          {/* CUSTOMER */}

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8e9e2] text-sm font-black text-[#57213f]">
                                {user.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </div>

                              <div>

                                <p className="text-sm font-bold text-[#57213f]">
                                  {user.name || "Unknown User"}
                                </p>

                                {user.phone && (
                                  <p className="text-xs text-[#9b7b83]">
                                    {user.phone}
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td className="px-4 py-4 text-sm text-[#805f68]">
                            {user.email}
                          </td>

                          {/* MEMBERSHIP */}

                          <td className="px-4 py-4">

                            <span className="rounded-full bg-[#f8e9e2] px-3 py-1 text-xs font-bold capitalize text-[#57213f]">
                              {user.membership}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-4">

                            {user.isEmailVerified ? (

                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">

                                <Icon
                                  path={mdiCheckCircleOutline}
                                  size={0.65}
                                />

                                Verified

                              </span>

                            ) : (

                              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                Unverified
                              </span>

                            )}

                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            )}

          </motion.section>

          {/* ========================================
              LOW STOCK ALERT
          ======================================== */}

          <div className="mt-6">

            <div className="flex items-center gap-4 rounded-3xl border border-[#f0ded5] bg-white p-5 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">

                <Icon
                  path={mdiAlertCircleOutline}
                  size={1}
                />

              </div>

              <div>

                <p className="text-sm font-black text-[#57213f]">
                  Low Stock Products
                </p>

                <p className="mt-1 text-xs font-medium text-[#805f68]">

                  {loadingDashboard
                    ? "Checking inventory..."
                    : `${lowStockProducts} product${
                        lowStockProducts === 1
                          ? ""
                          : "s"
                      } with stock of 5 or less.`}

                </p>

              </div>

            </div>

          </div>

          {/* ========================================
              QUICK ACTIONS + STORE STATUS
          ======================================== */}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* QUICK ACTIONS */}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-[#f0ded5] bg-white p-6 shadow-sm"
            >

              <div className="mb-6">

                <h2 className="text-lg font-black text-[#57213f]">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-[#805f68]">
                  Manage your store quickly.
                </p>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                {/* PRODUCTS */}

                <button
                  type="button"
                  onClick={() => router.push("/admin/products")}
                  className="flex items-center justify-between rounded-2xl border border-[#ead6ce] p-4 text-left transition hover:border-[#c87965] hover:bg-[#fffaf5]"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e9e2] text-[#57213f]">

                      <Icon
                        path={mdiPackageVariantClosed}
                        size={0.9}
                      />

                    </div>

                    <div>

                      <p className="text-sm font-bold text-[#57213f]">
                        Products
                      </p>

                      <p className="text-xs text-[#805f68]">
                        Manage products
                      </p>

                    </div>

                  </div>

                  <Icon
                    path={mdiArrowRight}
                    size={0.8}
                  />

                </button>

                {/* ORDERS */}

                <button
                  type="button"
                  onClick={() => router.push("/admin/orders")}
                  className="flex items-center justify-between rounded-2xl border border-[#ead6ce] p-4 text-left transition hover:border-[#c87965] hover:bg-[#fffaf5]"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e9e2] text-[#57213f]">

                      <Icon
                        path={mdiCartOutline}
                        size={0.9}
                      />

                    </div>

                    <div>

                      <p className="text-sm font-bold text-[#57213f]">
                        Orders
                      </p>

                      <p className="text-xs text-[#805f68]">
                        View customer orders
                      </p>

                    </div>

                  </div>

                  <Icon
                    path={mdiArrowRight}
                    size={0.8}
                  />

                </button>

                {/* USERS */}

                <button
                  type="button"
                  onClick={() => router.push("/admin/users")}
                  className="flex items-center justify-between rounded-2xl border border-[#ead6ce] p-4 text-left transition hover:border-[#c87965] hover:bg-[#fffaf5]"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e9e2] text-[#57213f]">

                      <Icon
                        path={mdiAccountMultipleOutline}
                        size={0.9}
                      />

                    </div>

                    <div>

                      <p className="text-sm font-bold text-[#57213f]">
                        Users
                      </p>

                      <p className="text-xs text-[#805f68]">
                        Manage customers
                      </p>

                    </div>

                  </div>

                  <Icon
                    path={mdiArrowRight}
                    size={0.8}
                  />

                </button>

                {/* NOTIFICATIONS */}

                <button
                  type="button"
                  onClick={() => router.push("/admin/notification")}
                  className="flex items-center justify-between rounded-2xl border border-[#ead6ce] p-4 text-left transition hover:border-[#c87965] hover:bg-[#fffaf5]"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e9e2] text-[#57213f]">

                      <Icon
                        path={mdiBellOutline}
                        size={0.9}
                      />

                    </div>

                    <div>

                      <p className="text-sm font-bold text-[#57213f]">
                        Notifications
                      </p>

                      <p className="text-xs text-[#805f68]">
                        View store alerts
                      </p>

                    </div>

                  </div>

                  <Icon
                    path={mdiArrowRight}
                    size={0.8}
                  />

                </button>

              </div>

            </motion.section>

            {/* STORE STATUS */}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-[#f0ded5] bg-white p-6 shadow-sm"
            >

              <div className="mb-6">

                <h2 className="text-lg font-black text-[#57213f]">
                  Store Status
                </h2>

                <p className="mt-1 text-sm text-[#805f68]">
                  Current store activity.
                </p>

              </div>

              <div className="space-y-4">

                {/* STORE ONLINE */}

                <div className="flex items-center gap-4 rounded-2xl bg-[#fffaf5] p-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">

                    <Icon
                      path={mdiCheckCircleOutline}
                      size={0.9}
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-[#57213f]">
                      Store Online
                    </p>

                    <p className="text-xs text-[#805f68]">
                      Your store is currently active.
                    </p>

                  </div>

                </div>

                {/* ADMIN SESSION */}

                <div className="flex items-center gap-4 rounded-2xl bg-[#fffaf5] p-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                    <Icon
                      path={mdiClockOutline}
                      size={0.9}
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-[#57213f]">
                      Admin Session
                    </p>

                    <p className="text-xs text-[#805f68]">
                      Logged in as {admin.email || "Admin"}
                    </p>

                  </div>

                </div>

                {/* INVENTORY ALERT */}

                <div className="flex items-center gap-4 rounded-2xl bg-[#fffaf5] p-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">

                    <Icon
                      path={mdiAlertCircleOutline}
                      size={0.9}
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-[#57213f]">
                      Inventory Alert
                    </p>

                    <p className="text-xs text-[#805f68]">

                      {loadingDashboard
                        ? "Checking inventory..."
                        : `${lowStockProducts} low-stock product${
                            lowStockProducts === 1
                              ? ""
                              : "s"
                          } need attention.`}

                    </p>

                  </div>

                </div>

              </div>

            </motion.section>

          </div>

        </div>
      </div>
    </main>
  );
}