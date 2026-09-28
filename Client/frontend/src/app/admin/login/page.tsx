"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  mdiEye,
  mdiEyeOff,
  mdiLockOutline,
  mdiEmailOutline,
  mdiShieldCheckOutline,
  mdiArrowLeft,
} from "@mdi/js";
import Icon from "@mdi/react";

import { loginUser } from "@/services/auth.service";
import Notification from "@/components/notification/Notification";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const showMessage = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setNotification({
      type,
      title,
      message,
    });
  };

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      showMessage(
        "error",
        "Email Required",
        "Please enter your admin email address."
      );
      return;
    }

    if (!password) {
      showMessage(
        "error",
        "Password Required",
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: email.trim(),
        password,
      });

      /*
       * Only admin users are allowed to access
       * the admin dashboard.
       */
      if (response.user?.role !== "admin") {
        showMessage(
          "error",
          "Access Denied",
          "You do not have permission to access the admin panel."
        );
        return;
      }

      /*
       * Store authentication information.
       *
       * Use the same localStorage keys used by your
       * existing customer login flow.
       *
       * If your current login uses different keys,
       * we will align them after checking that file.
       */
      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      showMessage(
        "success",
        "Login Successful",
        "Welcome to the ZestBag Admin Panel."
      );

      setTimeout(() => {
        router.push("/admin");
      }, 700);
    } catch (error: any) {
      console.error("Admin login error:", error);

      const message =
        error?.response?.data?.message ||
        "Invalid email or password.";

      showMessage(
        "error",
        "Login Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-8 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#f0ded5] bg-white shadow-[0_25px_80px_rgba(87,33,63,0.10)] lg:grid-cols-2">

          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative hidden overflow-hidden bg-[#57213f] p-10 text-white lg:flex lg:flex-col lg:justify-between"
          >
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c87965]/20" />

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#e87551]/10" />

            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Icon
                    path={mdiShieldCheckOutline}
                    size={1.25}
                  />
                </div>

                <div>
                  <p className="text-xl font-black">
                    ZestBag
                  </p>

                  <p className="text-xs font-medium text-white/60">
                    Administration
                  </p>
                </div>
              </div>

              <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#e8a08e]">
                Secure Access
              </p>

              <h1 className="max-w-md text-4xl font-black leading-tight">
                Manage your ZestBag store with confidence.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                Manage products, orders, customers, inventory
                and important store activities from one secure
                dashboard.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon
                  path={mdiShieldCheckOutline}
                  size={0.95}
                  className="mb-3 text-[#e8a08e]"
                />

                <p className="text-sm font-bold">
                  Secure Admin
                </p>

                <p className="mt-1 text-xs text-white/50">
                  Role protected access
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon
                  path={mdiLockOutline}
                  size={0.95}
                  className="mb-3 text-[#e8a08e]"
                />

                <p className="text-sm font-bold">
                  Protected
                </p>

                <p className="mt-1 text-xs text-white/50">
                  Secure authentication
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 sm:p-10 lg:p-14"
          >
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-8 flex items-center gap-2 text-sm font-semibold text-[#805f68] transition hover:text-[#57213f]"
            >
              <Icon
                path={mdiArrowLeft}
                size={0.75}
              />

              Back to Store
            </button>

            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#57213f]">
                <Icon
                  path={mdiShieldCheckOutline}
                  size={1.3}
                />
              </div>

              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#c87965]">
                Admin Portal
              </p>

              <h2 className="text-3xl font-black text-[#57213f] sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#805f68]">
                Sign in with your administrator account to
                continue.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-sm font-bold text-[#57213f]"
                >
                  Admin Email
                </label>

                <div className="relative">
                  <Icon
                    path={mdiEmailOutline}
                    size={0.85}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98991]"
                  />

                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-[#ead6ce] bg-[#fffaf5] py-3.5 pl-12 pr-4 text-sm text-[#57213f] outline-none transition placeholder:text-[#b99ba1] focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-bold text-[#57213f]"
                >
                  Password
                </label>

                <div className="relative">
                  <Icon
                    path={mdiLockOutline}
                    size={0.85}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98991]"
                  />

                  <input
                    id="admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-[#ead6ce] bg-[#fffaf5] py-3.5 pl-12 pr-12 text-sm text-[#57213f] outline-none transition placeholder:text-[#b99ba1] focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b98991] transition hover:text-[#57213f]"
                  >
                    <Icon
                      path={
                        showPassword
                          ? mdiEyeOff
                          : mdiEye
                      }
                      size={0.85}
                    />
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-[#57213f] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#713052] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In to Admin Panel"}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-[#f0ded5] bg-[#fffaf5] p-4">
              <div className="flex gap-3">
                <Icon
                  path={mdiShieldCheckOutline}
                  size={0.85}
                  className="mt-0.5 shrink-0 text-[#c87965]"
                />

                <p className="text-xs leading-5 text-[#805f68]">
                  This area is restricted to authorized
                  administrators. Customer accounts cannot
                  access the admin dashboard.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}