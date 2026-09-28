"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Icon from "@mdi/react";

import {
  mdiAccountMultipleOutline,
  mdiArrowLeft,
  mdiMagnify,
  mdiEmailOutline,
  mdiPhoneOutline,
  mdiMapMarkerOutline,
  mdiCalendarOutline,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiCrownOutline,
  mdiChevronRight,
  mdiClose,
} from "@mdi/js";

import {
  getAdminUsers,
  type AdminUser,
} from "../../../services/admin.service";

type LoggedInAdmin = {
  name?: string;
  email?: string;
  role?: string;
};

export default function AdminUsersPage() {
  const router = useRouter();

  // ========================================
  // AUTH
  // ========================================

  const [admin, setAdmin] = useState<LoggedInAdmin | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ========================================
  // USERS
  // ========================================

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // SEARCH
  // ========================================

  const [search, setSearch] = useState("");

  // ========================================
  // SELECTED USER
  // ========================================

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  // ========================================
  // CHECK ADMIN AUTH
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
  // LOAD USERS
  // ========================================

  useEffect(() => {
    if (!admin) {
      return;
    }

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError("");

        const data = await getAdminUsers();

        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);

        setError(
          "Unable to load customers. Please try again."
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [admin]);

  // ========================================
  // FILTER USERS
  // ========================================

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue) ||
        user.phone?.toLowerCase().includes(searchValue) ||
        user.membership?.toLowerCase().includes(searchValue)
      );
    });
  }, [users, search]);

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#57213f]">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="sticky top-0 z-30 border-b border-[#f0ded5] bg-[#fffaf5]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ead6ce] bg-white text-[#57213f] transition hover:border-[#c87965]"
            >
              <Icon
                path={mdiArrowLeft}
                size={0.85}
              />
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#c87965]">
                Admin
              </p>

              <h1 className="text-xl font-black text-[#57213f] sm:text-2xl">
                Customers
              </h1>
            </div>

          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#57213f]">
            <Icon
              path={mdiAccountMultipleOutline}
              size={1}
            />
          </div>

        </div>
      </header>

      {/* ========================================
          CONTENT
      ======================================== */}

      <div className="px-4 py-8 sm:px-6 lg:px-10">

        <div className="mx-auto max-w-7xl">

          {/* ========================================
              PAGE TITLE
          ======================================== */}

          <div className="mb-6">

            <h2 className="text-2xl font-black text-[#57213f]">
              All Customers
            </h2>

            <p className="mt-1 text-sm text-[#805f68]">
              View and manage registered customers.
            </p>

          </div>

          {/* ========================================
              SEARCH + COUNT
          ======================================== */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* SEARCH */}

            <div className="relative w-full sm:max-w-md">

              <Icon
                path={mdiMagnify}
                size={0.9}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7b83]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email or phone..."
                className="w-full rounded-2xl border border-[#ead6ce] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#57213f] outline-none transition placeholder:text-[#b69aa1] focus:border-[#c87965]"
              />

            </div>

            {/* COUNT */}

            <div className="rounded-2xl border border-[#ead6ce] bg-white px-5 py-3">

              <p className="text-xs font-semibold text-[#9b7b83]">
                Customers
              </p>

              <p className="text-lg font-black text-[#57213f]">
                {filteredUsers.length}
              </p>

            </div>

          </div>

          {/* ========================================
              ERROR
          ======================================== */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* ========================================
              USERS TABLE
          ======================================== */}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-[#f0ded5] bg-white shadow-sm"
          >

            {loadingUsers ? (

              <div className="flex min-h-[300px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead6ce] border-t-[#57213f]" />

                  <p className="mt-4 text-sm font-semibold text-[#805f68]">
                    Loading customers...
                  </p>

                </div>

              </div>

            ) : filteredUsers.length === 0 ? (

              <div className="flex min-h-[300px] items-center justify-center px-6">

                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#57213f]">

                    <Icon
                      path={mdiAccountMultipleOutline}
                      size={1.2}
                    />

                  </div>

                  <h3 className="mt-4 text-lg font-black text-[#57213f]">
                    No customers found
                  </h3>

                  <p className="mt-1 text-sm text-[#805f68]">
                    Try changing your search.
                  </p>

                </div>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead>
                    <tr className="border-b border-[#f0ded5] bg-[#fffaf5] text-left">

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Membership
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Registered
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#9b7b83]">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredUsers.map((user) => (

                      <tr
                        key={user._id}
                        className="border-b border-[#f7ebe5] transition hover:bg-[#fffaf5]"
                      >

                        {/* CUSTOMER */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f8e9e2] text-sm font-black text-[#57213f]">
                              {user.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </div>

                            <div>

                              <p className="text-sm font-bold text-[#57213f]">
                                {user.name || "Unknown User"}
                              </p>

                              <p className="text-xs text-[#9b7b83]">
                                Customer
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td className="px-6 py-4">

                          <div className="space-y-1">

                            <div className="flex items-center gap-2">

                              <Icon
                                path={mdiEmailOutline}
                                size={0.7}
                                className="text-[#9b7b83]"
                              />

                              <span className="text-sm text-[#805f68]">
                                {user.email}
                              </span>

                            </div>

                            {user.phone && (
                              <div className="flex items-center gap-2">

                                <Icon
                                  path={mdiPhoneOutline}
                                  size={0.7}
                                  className="text-[#9b7b83]"
                                />

                                <span className="text-xs text-[#9b7b83]">
                                  {user.phone}
                                </span>

                              </div>
                            )}

                          </div>

                        </td>

                        {/* MEMBERSHIP */}

                        <td className="px-6 py-4">

                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f8e9e2] px-3 py-1 text-xs font-bold capitalize text-[#57213f]">

                            {user.membership === "premium" && (
                              <Icon
                                path={mdiCrownOutline}
                                size={0.65}
                              />
                            )}

                            {user.membership}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          {user.isEmailVerified ? (

                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">

                              <Icon
                                path={mdiCheckCircleOutline}
                                size={0.7}
                              />

                              Verified

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">

                              <Icon
                                path={mdiCloseCircleOutline}
                                size={0.7}
                              />

                              Unverified

                            </span>

                          )}

                        </td>

                        {/* REGISTERED */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2">

                            <Icon
                              path={mdiCalendarOutline}
                              size={0.7}
                              className="text-[#9b7b83]"
                            />

                            <span className="text-sm text-[#805f68]">
                              {formatDate(user.createdAt)}
                            </span>

                          </div>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedUser(user)
                            }
                            className="flex items-center gap-1 rounded-xl border border-[#ead6ce] px-3 py-2 text-xs font-bold text-[#57213f] transition hover:border-[#c87965] hover:bg-[#fffaf5]"
                          >
                            View

                            <Icon
                              path={mdiChevronRight}
                              size={0.7}
                            />

                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </motion.section>

        </div>

      </div>

      {/* ========================================
          USER DETAILS MODAL
      ======================================== */}

      {selectedUser && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >

            {/* MODAL HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-[#f0ded5] bg-white px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#c87965]">
                  Customer Details
                </p>

                <h2 className="mt-1 text-xl font-black text-[#57213f]">
                  {selectedUser.name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ead6ce] text-[#57213f] transition hover:border-[#c87965]"
              >
                <Icon
                  path={mdiClose}
                  size={0.8}
                />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="p-6">

              {/* PROFILE */}

              <div className="mb-6 flex items-center gap-4 rounded-2xl bg-[#fffaf5] p-5">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f8e9e2] text-xl font-black text-[#57213f]">
                  {selectedUser.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div>

                  <h3 className="text-lg font-black text-[#57213f]">
                    {selectedUser.name}
                  </h3>

                  <p className="text-sm text-[#805f68]">
                    {selectedUser.email}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    <span className="rounded-full bg-[#f8e9e2] px-3 py-1 text-xs font-bold capitalize text-[#57213f]">
                      {selectedUser.membership}
                    </span>

                    {selectedUser.isEmailVerified ? (

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Email Verified
                      </span>

                    ) : (

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        Email Unverified
                      </span>

                    )}

                  </div>

                </div>

              </div>

              {/* CONTACT DETAILS */}

              <div className="grid gap-4 sm:grid-cols-2">

                {/* EMAIL */}

                <div className="rounded-2xl border border-[#f0ded5] p-4">

                  <div className="flex items-center gap-2">

                    <Icon
                      path={mdiEmailOutline}
                      size={0.8}
                      className="text-[#c87965]"
                    />

                    <p className="text-xs font-bold uppercase tracking-wide text-[#9b7b83]">
                      Email
                    </p>

                  </div>

                  <p className="mt-2 break-all text-sm font-semibold text-[#57213f]">
                    {selectedUser.email || "-"}
                  </p>

                </div>

                {/* PHONE */}

                <div className="rounded-2xl border border-[#f0ded5] p-4">

                  <div className="flex items-center gap-2">

                    <Icon
                      path={mdiPhoneOutline}
                      size={0.8}
                      className="text-[#c87965]"
                    />

                    <p className="text-xs font-bold uppercase tracking-wide text-[#9b7b83]">
                      Phone
                    </p>

                  </div>

                  <p className="mt-2 text-sm font-semibold text-[#57213f]">
                    {selectedUser.phone || "-"}
                  </p>

                </div>

              </div>

              {/* ADDRESS */}

              <div className="mt-4 rounded-2xl border border-[#f0ded5] p-4">

                <div className="flex items-center gap-2">

                  <Icon
                    path={mdiMapMarkerOutline}
                    size={0.8}
                    className="text-[#c87965]"
                  />

                  <p className="text-xs font-bold uppercase tracking-wide text-[#9b7b83]">
                    Address
                  </p>

                </div>

                <div className="mt-3 space-y-1 text-sm text-[#57213f]">

                  <p>
                    {selectedUser.address || "-"}
                  </p>

                  <p>
                    {[
                      selectedUser.city,
                      selectedUser.district,
                      selectedUser.state,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>

                  <p>
                    Pincode: {selectedUser.pincode || "-"}
                  </p>

                </div>

              </div>

              {/* ACCOUNT INFORMATION */}

              <div className="mt-4 rounded-2xl border border-[#f0ded5] p-4">

                <p className="text-xs font-bold uppercase tracking-wide text-[#9b7b83]">
                  Account Information
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <div>

                    <p className="text-xs text-[#9b7b83]">
                      Membership
                    </p>

                    <p className="mt-1 text-sm font-bold capitalize text-[#57213f]">
                      {selectedUser.membership || "-"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-[#9b7b83]">
                      Email Status
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#57213f]">
                      {selectedUser.isEmailVerified
                        ? "Verified"
                        : "Not Verified"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-[#9b7b83]">
                      Registered On
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#57213f]">
                      {formatDate(selectedUser.createdAt)}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-[#9b7b83]">
                      Customer ID
                    </p>

                    <p className="mt-1 break-all text-xs font-semibold text-[#57213f]">
                      {selectedUser._id}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t border-[#f0ded5] px-6 py-4">

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full rounded-2xl bg-[#57213f] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                Close
              </button>

            </div>

          </motion.div>

        </div>

      )}

    </main>
  );
}