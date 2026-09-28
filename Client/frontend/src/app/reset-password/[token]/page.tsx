"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  resetPassword,
  validateResetPasswordToken,
} from "../../../services/auth.service";

import Notification from "../../../components/notification/Notification";

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams();

  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Token validation state
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const [passwordReset, setPasswordReset] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] =
    useState<"success" | "error">("success");

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const showMessage = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setNotificationType(type);
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  // Validate reset token when page loads
  useEffect(() => {
    const checkResetToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsCheckingToken(false);
        return;
      }

      try {
        await validateResetPasswordToken(token);

        setIsTokenValid(true);
      } catch (error: any) {
        console.error("Reset token validation failed:", error);

        setIsTokenValid(false);

        let message =
          "This password reset link is invalid or has expired.";

        if (error?.response?.data?.message) {
          message = error.response.data.message;
        }

        showMessage(
          "error",
          "Invalid Reset Link",
          message
        );
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkResetToken();
  }, [token]);

  const validatePassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      value
    );
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token || !isTokenValid) {
      showMessage(
        "error",
        "Invalid Reset Link",
        "This password reset link is invalid or has expired."
      );
      return;
    }

    if (!password || !confirmPassword) {
      showMessage(
        "error",
        "Required Fields",
        "Please enter your new password and confirm password."
      );
      return;
    }

    if (!validatePassword(password)) {
      showMessage(
        "error",
        "Invalid Password",
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        "error",
        "Passwords Do Not Match",
        "New password and confirm password must be the same."
      );
      return;
    }

    setIsLoading(true);

    try {
      const data = await resetPassword(token, {
        password,
        confirmPassword,
      });

      showMessage(
        "success",
        "Password Reset Successful",
        data.message ||
          "Your password has been reset successfully."
      );

      setPasswordReset(true);

      // Token is no longer valid after successful reset
      setIsTokenValid(false);
    } catch (error: any) {
      console.error("Reset password failed:", error);

      let message =
        "Unable to reset your password. Please try again.";

      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.request) {
        message =
          "Unable to connect to the server. Please make sure the backend is running.";
      }

      showMessage(
        "error",
        "Reset Failed",
        message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf7]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#f8d8c8]/50 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#e9c8dc]/50 blur-3xl"
        />
      </div>

      {/* Notification */}
      {showNotification && (
        <Notification
          type={notificationType}
          title={notificationTitle}
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-2xl font-extrabold tracking-tight text-[#4a1d3f]"
        >
          Zest<span className="text-[#e87551]">Bag</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 text-sm font-semibold text-[#741747] transition hover:text-[#e87551]"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>
      </header>

      {/* Main content */}
      <section className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
          {/* Left section */}
          <div className="hidden bg-[#4a1d3f] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck size={30} />
              </div>

              <h1 className="text-4xl font-extrabold leading-tight">
                Create a new
                <span className="block text-[#f3a080]">
                  password
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
                Choose a strong password to keep your ZestBag
                account secure. Once your password is updated,
                you can log in normally with your new password.
              </p>
            </div>

            <div className="mt-10 rounded-2xl bg-white/10 p-5">
              <div className="flex items-start gap-3">
                <LockKeyhole
                  size={22}
                  className="mt-0.5 shrink-0 text-[#f3a080]"
                />

                <div>
                  <h3 className="font-semibold">
                    Keep your account secure
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-white/70">
                    Use a unique password that you do not use on
                    other websites.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="p-6 sm:p-10">
            {/* Checking token */}
            {isCheckingToken ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[480px] flex-col items-center justify-center text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f8e9e2] text-[#741747]">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#741747]/20 border-t-[#741747]" />
                </div>

                <h2 className="mt-6 text-2xl font-extrabold text-[#4a1d3f]">
                  Checking Reset Link
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                  Please wait while we verify your password reset
                  link.
                </p>
              </motion.div>
            ) : !isTokenValid && !passwordReset ? (
              /* Invalid / expired token */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex min-h-[480px] flex-col items-center justify-center text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
                  <LockKeyhole size={38} />
                </div>

                <h2 className="mt-6 text-3xl font-extrabold text-[#4a1d3f]">
                  Reset Link Invalid
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                  This password reset link is invalid or has
                  expired. Please request a new password reset
                  link.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="mt-8 w-full max-w-sm rounded-xl bg-[#741747] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#741747]/20 transition hover:bg-[#5f123a]"
                >
                  Request New Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-3 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl border border-gray-200 py-3.5 text-sm font-bold text-[#741747] transition hover:bg-gray-50"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </button>
              </motion.div>
            ) : !passwordReset ? (
              <>
                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#741747]">
                    <LockKeyhole size={27} />
                  </div>

                  <h2 className="text-3xl font-extrabold text-[#4a1d3f]">
                    Reset Password
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Create a new password for your ZestBag
                    account.
                  </p>
                </motion.div>

                {/* Form */}
                <motion.form
                  onSubmit={handleResetPassword}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-8 space-y-5"
                >
                  {/* New password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700"
                    >
                      New Password
                    </label>

                    <div className="relative mt-2">
                      <LockKeyhole
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-[#741747] focus:bg-white focus:ring-2 focus:ring-[#741747]/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#741747]"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Confirm Password
                    </label>

                    <div className="relative mt-2">
                      <LockKeyhole
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-[#741747] focus:bg-white focus:ring-2 focus:ring-[#741747]/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#741747]"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password requirements */}
                  <div className="rounded-xl bg-[#fff7f3] p-4">
                    <p className="mb-2 text-xs font-bold text-[#4a1d3f]">
                      Password must contain:
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Check
                          size={14}
                          className="text-[#741747]"
                        />
                        At least 8 characters
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Check
                          size={14}
                          className="text-[#741747]"
                        />
                        One uppercase and one lowercase letter
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Check
                          size={14}
                          className="text-[#741747]"
                        />
                        One number
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Check
                          size={14}
                          className="text-[#741747]"
                        />
                        One special character
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#741747] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#741747]/20 transition hover:bg-[#5f123a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <Check size={18} />
                      </>
                    )}
                  </button>
                </motion.form>
              </>
            ) : (
              /* Success state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex min-h-[480px] flex-col items-center justify-center text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check size={40} />
                </div>

                <h2 className="mt-6 text-3xl font-extrabold text-[#4a1d3f]">
                  Password Reset!
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                  Your password has been successfully updated.
                  You can now log in to your ZestBag account using
                  your new password.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-8 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-[#741747] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#741747]/20 transition hover:bg-[#5f123a]"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}