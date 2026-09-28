"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Notification from "../../components/notification/Notification";
import { registerUser } from "../../services/auth.service";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<
    "success" | "error"
  >("success");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (
    type: "success" | "error",
    title: string,
    message: string,
  ) => {
    setNotificationType(type);
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const passwordRules = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const passwordIsValid =
    passwordRules.length &&
    passwordRules.lowercase &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special;

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      showMessage(
        "error",
        "Name Required",
        "Please enter your full name.",
      );
      return;
    }

    if (!emailRegex.test(email.trim())) {
      showMessage(
        "error",
        "Invalid Email",
        "Please enter a valid email address.",
      );
      return;
    }

    if (!passwordIsValid) {
      showMessage(
        "error",
        "Weak Password",
        "Password must contain at least 8 characters, uppercase, lowercase, number and special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        "error",
        "Password Mismatch",
        "Passwords do not match.",
      );
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      showMessage(
        "success",
        "OTP Sent",
        "A verification OTP has been sent to your email.",
      );

      setTimeout(() => {
        router.push(
          `/verify-otp?email=${encodeURIComponent(
            email.trim(),
          )}`,
        );
      }, 1500);
    } catch (error: any) {
      console.error("Registration failed:", error);

      let message =
        "Unable to register. Please check your details and try again.";

      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.request) {
        message =
          "Unable to connect to the server. Please make sure the backend is running.";
      }

      showMessage("error", "Registration Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf7] px-4 py-6 sm:px-6 lg:px-10">
      {/* Background Decorations */}
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
          <span className="hidden sm:inline">
            Back to Login
          </span>
          <span className="sm:hidden">Back</span>
        </button>
      </motion.header>

      {/* Main Layout */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-7xl items-center justify-center py-10">
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Left Side Content */}
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
              Welcome to ZestBag
            </p>

            <h1 className="max-w-md text-6xl font-bold leading-[1.05] text-[#75415d]">
              Start Your
              <br />
              Shopping
              <br />
              Journey
            </h1>

            <div className="my-7 h-1 w-16 rounded-full bg-[#e87551]" />

            <p className="max-w-sm text-lg leading-8 text-gray-500">
              Create your account and enjoy a smarter,
              safer and more personalized shopping
              experience.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-[#75415d]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5f1e9] text-[#4f8b73]">
                  <Check size={17} />
                </span>
                Easy and secure registration
              </div>

              <div className="flex items-center gap-3 text-sm font-medium text-[#75415d]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5f1e9] text-[#4f8b73]">
                  <Check size={17} />
                </span>
                Email verification with OTP
              </div>

              <div className="flex items-center gap-3 text-sm font-medium text-[#75415d]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5f1e9] text-[#4f8b73]">
                  <Check size={17} />
                </span>
                Personalized shopping experience
              </div>
            </div>
          </motion.div>

          {/* Register Card */}
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
                    <UserRound size={30} strokeWidth={1.8} />
                  </div>
                </div>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#571437] sm:text-4xl">
                  Create Account
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                  Join ZestBag and start your shopping
                  journey today.
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={handleRegister}
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
                {/* Name */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Full Name
                  </label>

                  <div className="relative mt-2">
                    <UserRound
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#75415d] focus:bg-[#fffaf7] focus:ring-4 focus:ring-[#75415d]/10"
                    />
                  </div>
                </motion.div>

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

                {/* Password */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">
                    <LockKeyhole
                      size={19}
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
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm text-gray-800 outline-none transition focus:border-[#75415d] focus:bg-[#fffaf7] focus:ring-4 focus:ring-[#75415d]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#75415d]"
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

                  {/* Password Rules */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-[#fff8f5] p-3 sm:grid-cols-2"
                    >
                      <PasswordRule
                        valid={passwordRules.length}
                        text="At least 8 characters"
                      />

                      <PasswordRule
                        valid={passwordRules.uppercase}
                        text="One uppercase letter"
                      />

                      <PasswordRule
                        valid={passwordRules.lowercase}
                        text="One lowercase letter"
                      />

                      <PasswordRule
                        valid={passwordRules.number}
                        text="One number"
                      />

                      <PasswordRule
                        valid={passwordRules.special}
                        text="One special character"
                      />
                    </motion.div>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative mt-2">
                    <LockKeyhole
                      size={19}
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
                        setConfirmPassword(
                          event.target.value,
                        )
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm text-gray-800 outline-none transition focus:border-[#75415d] focus:bg-[#fffaf7] focus:ring-4 focus:ring-[#75415d]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#75415d]"
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

                  {confirmPassword.length > 0 && (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        password === confirmPassword
                          ? "text-[#4f8b73]"
                          : "text-red-500"
                      }`}
                    >
                      {password === confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
                </motion.div>

                {/* Submit Button */}
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight
                          size={20}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.form>

              {/* Login Link */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-7 text-center text-sm text-gray-500"
              >
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-bold text-[#741747] transition hover:text-[#e87551]"
                >
                  Login
                </button>
              </motion.p>

              {/* Security Message */}
              <div className="mt-7 flex gap-3 rounded-2xl bg-[#f8f8f7] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4f1e9] text-[#4f8b73]">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Your privacy matters
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Your account is protected with secure
                    email verification.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                <LockKeyhole size={14} />
                Secure registration
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

/* Password Rule Component */
function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valid ? "text-[#4f8b73]" : "text-gray-400"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          valid
            ? "bg-[#4f8b73] text-white"
            : "border border-gray-300"
        }`}
      >
        {valid && <Check size={11} />}
      </span>

      <span>{text}</span>
    </div>
  );
}