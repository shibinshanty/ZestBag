"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  RefreshCw,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

import { forgotPassword } from "../../services/auth.service";
import Notification from "../../components/notification/Notification";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [showNotification, setShowNotification] = useState(false);

  const [notificationType, setNotificationType] = useState<
    "success" | "error"
  >("success");

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

  const handleForgotPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      showMessage(
        "error",
        "Email Required",
        "Please enter your email address."
      );
      return;
    }

    setIsLoading(true);

    try {
      const data = await forgotPassword({
        email: email.trim(),
      });

      showMessage(
        "success",
        "Reset Link Sent",
        data.message ||
          "A password reset link has been sent to your email."
      );

      setEmailSent(true);
    } catch (error: any) {
      console.error("Forgot password failed:", error);

      let message =
        "Unable to send the password reset link. Please try again.";

      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.request) {
        message =
          "Unable to connect to the server. Please make sure the backend is running.";
      }

      showMessage("error", "Request Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf7] px-4 py-6 sm:px-6 lg:px-10">
      {/* Animated Background */}
      <motion.div
        className="pointer-events-none absolute -left-40 top-40 h-[450px] w-[450px] rounded-full bg-[#fce4d9] blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="pointer-events-none absolute -right-40 bottom-[-100px] h-[550px] w-[550px] rounded-full bg-[#f7c4ae] blur-3xl"
        animate={{
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between"
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-left"
        >
          <div className="text-3xl font-extrabold tracking-tight text-[#571437]">
            Zest<span className="text-[#e87551]">Bag</span>
          </div>

          <p className="mt-1 text-xs font-medium tracking-wide text-gray-500">
            Shop Smart. Live Better.
          </p>
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#75415d] transition hover:bg-white"
        >
          <ArrowLeft
            size={17}
            className="transition-transform group-hover:-translate-x-1"
          />

          <span className="hidden sm:inline">Back to Login</span>
          <span className="sm:hidden">Login</span>
        </button>
      </motion.header>

      {/* Main Content */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-7xl items-center justify-center py-10">
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="hidden lg:block"
          >
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#e87551]">
              Account Recovery
            </p>

            <h1 className="max-w-md text-6xl font-bold leading-[1.05] text-[#75415d]">
              Forgot
              <br />
              Your
              <br />
              Password?
            </h1>

            <div className="my-7 h-1 w-16 rounded-full bg-[#e87551]" />

            <p className="max-w-sm text-lg leading-8 text-gray-500">
              No worries. Enter your registered email address and we&apos;ll
              help you securely recover your ZestBag account.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-[#75415d]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5f1e9] text-[#4f8b73]">
                  <Check size={17} />
                </span>
                Secure password recovery
              </div>

              <div className="flex items-center gap-3 text-sm font-medium text-[#75415d]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5f1e9] text-[#4f8b73]">
                  <Check size={17} />
                </span>
                Reset link sent to your email
              </div>

              <div className="flex items-center gap-3 text-sm font-medium text-[#75415d]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5f1e9] text-[#4f8b73]">
                  <Check size={17} />
                </span>
                Simple and secure process
              </div>
            </div>
          </motion.div>

          {/* Forgot Password Card */}
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: "easeOut",
            }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="rounded-[30px] border border-white/80 bg-white/95 p-6 shadow-[0_25px_80px_rgba(91,43,63,0.12)] backdrop-blur sm:p-10">
              {/* Card Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff0e9]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbd8c9] text-[#75415d]">
                    <Mail size={30} strokeWidth={1.8} />
                  </div>
                </div>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#571437] sm:text-4xl">
                  Forgot Password?
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                  Enter your registered email address and we&apos;ll send you
                  a secure password reset link.
                </p>
              </motion.div>

              {/* Success State */}
              {emailSent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f1e9] text-[#4f8b73]">
                    <Check size={30} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#571437]">
                    Reset Link Sent
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    We&apos;ve sent a password reset link to:
                  </p>

                  <p className="mt-2 break-all font-semibold text-[#75415d]">
                    {email}
                  </p>

                  <p className="mt-4 text-xs leading-5 text-gray-400">
                    Please check your inbox and follow the link to create a
                    new password. The reset link will expire after 15 minutes.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="group mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#741747] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#741747]/20 transition hover:bg-[#5b1036]"
                  >
                    Back to Login
                    <ArrowRight
                      size={20}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailSent(false);
                      setShowNotification(false);
                    }}
                    className="mt-4 text-sm font-semibold text-[#741747] transition hover:text-[#e87551]"
                  >
                    Use another email
                  </button>
                </motion.div>
              ) : (
                /* Forgot Password Form */
                <motion.form
                  onSubmit={handleForgotPassword}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        delayChildren: 0.4,
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                  className="mt-8 space-y-5"
                >
                  {/* Email */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Email Address
                    </label>

                    <div className="relative mt-2">
                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#75415d] focus:bg-[#fffaf7] focus:ring-4 focus:ring-[#75415d]/10"
                      />
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#741747] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#741747]/20 transition hover:bg-[#5b1036] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw
                            size={20}
                            className="animate-spin"
                          />
                          Sending Reset Link...
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight
                            size={20}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>
                  </motion.div>
                </motion.form>
              )}

              {/* Security Message */}
              <div className="mt-7 flex gap-3 rounded-2xl bg-[#f8f8f7] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4f1e9] text-[#4f8b73]">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Your security matters
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Your password reset request is protected with secure
                    authentication.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                <LockKeyhole size={14} />
                Secure password recovery
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notification */}
      {showNotification && (
        <Notification
          type={notificationType}
          title={notificationTitle}
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
    </main>
  );
}