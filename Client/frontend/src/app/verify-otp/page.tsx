"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

import Notification from "../../components/notification/Notification";
import { resendOtp, verifyOtp } from "../../services/auth.service";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success",
  );
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setEmail(emailFromUrl);
  }, [emailFromUrl]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

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

  const handleOtpChange = (index: number, value: string) => {
    // Allow only one number
    const numericValue = value.replace(/\D/g, "").slice(-1);

    const updatedOtp = [...otp];
    updatedOtp[index] = numericValue;
    setOtp(updatedOtp);

    // Move to next input automatically
    if (numericValue && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const pastedOtp = pastedValue
      .split("")
      .concat(["", "", "", "", "", ""])
      .slice(0, 6);

    setOtp(pastedOtp);

    const nextIndex = Math.min(pastedValue.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const enteredOtp = otp.join("");

    if (!email) {
      showMessage(
        "error",
        "Email Missing",
        "Email address is missing. Please register again.",
      );
      return;
    }

    if (enteredOtp.length !== 6) {
      showMessage(
        "error",
        "Invalid OTP",
        "Please enter the complete 6-digit OTP.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOtp({
        email,
        otp: enteredOtp,
      });

      // If your backend returns a token after verification
      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      if (response?.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      showMessage(
        "success",
        "Email Verified",
        response?.message || "Your email has been verified successfully.",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error("OTP verification failed:", error);

      showMessage(
        "error",
        "Verification Failed",
        error?.response?.data?.message ||
          "The OTP is invalid or expired. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;

    if (!email) {
      showMessage(
        "error",
        "Email Missing",
        "Email address is missing. Please register again.",
      );
      return;
    }

    setIsResending(true);

    try {
      const response = await resendOtp({
        email,
      });

      setOtp(["", "", "", "", "", ""]);
      setCountdown(30);

      inputRefs.current[0]?.focus();

      showMessage(
        "success",
        "OTP Resent",
        response?.message || "A new OTP has been sent to your email.",
      );
    } catch (error: any) {
      console.error("Resend OTP failed:", error);

      showMessage(
        "error",
        "Unable to Resend",
        error?.response?.data?.message ||
          "Unable to resend OTP. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, "$1••••$3")
    : "your email address";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf7] px-4 py-6 sm:px-6 lg:px-10">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-[#fce8df] opacity-70 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-[-100px] h-[500px] w-[500px] rounded-full bg-[#f8c4ad] opacity-50 blur-3xl" />

      <div className="pointer-events-none absolute right-20 top-24 hidden text-6xl text-[#f4b49b] opacity-50 lg:block">
        “
      </div>

      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="group">
          <div className="text-3xl font-extrabold tracking-tight text-[#571437]">
            Zest<span className="text-[#e87551]">Bag</span>
          </div>

          <p className="mt-1 text-xs font-medium tracking-wide text-gray-500">
            Shop Smart. Live Better.
          </p>
        </Link>

        <Link
          href="/register"
          className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#75415d] transition hover:bg-white hover:text-[#571437] sm:px-4"
        >
          <ArrowLeft
            size={17}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span className="hidden sm:inline">Back to Register</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </header>

      {/* Main Content */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-7xl items-center justify-center py-10">
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          {/* Left Content */}
          <div className="hidden lg:block">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#e87551]">
              Almost There
            </p>

            <h1 className="max-w-sm text-6xl font-bold leading-[1.05] text-[#75415d]">
              One
              <br />
              Step
              <br />
              Closer
            </h1>

            <div className="my-7 h-1 w-16 rounded-full bg-[#e87551]" />

            <p className="max-w-xs text-lg leading-8 text-gray-500">
              Verify your email and continue your safer, smarter shopping
              experience.
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm font-medium text-[#75415d]">
              <CheckCircle2 size={20} className="text-[#4f8b73]" />
              Secure account verification
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm font-medium text-[#75415d]">
              <CheckCircle2 size={20} className="text-[#4f8b73]" />
              Fast and simple process
            </div>
          </div>

          {/* OTP Card */}
          <div className="mx-auto w-full max-w-xl rounded-[30px] border border-white/80 bg-white/95 p-6 shadow-[0_25px_80px_rgba(91,43,63,0.12)] backdrop-blur sm:p-10">
            {/* Icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#fff0e9]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbd8c9] text-[#75415d]">
                <Mail size={34} strokeWidth={1.8} />
              </div>
            </div>

            {/* Heading */}
            <div className="mt-7 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#571437] sm:text-4xl">
                Verify Your Email
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                We have sent a 6-digit verification code to
              </p>

              <p className="mt-1 break-all font-bold text-[#75415d]">
                {maskedEmail}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                Enter the code below to verify your account.
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleVerifyOtp} className="mt-8">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleOtpChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    aria-label={`OTP digit ${index + 1}`}
                    className={`h-12 w-10 rounded-xl border-2 bg-white text-center text-xl font-bold text-[#571437] outline-none transition-all sm:h-14 sm:w-14 sm:text-2xl ${
                      digit
                        ? "border-[#75415d] bg-[#fff8f5]"
                        : "border-gray-200"
                    } focus:border-[#75415d] focus:bg-[#fff8f5] focus:ring-4 focus:ring-[#75415d]/10`}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#741747] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#741747]/20 transition hover:bg-[#5b1036] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm font-medium text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#fff1ec] px-6 py-4 font-bold text-[#741747] transition hover:bg-[#ffe5dc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={20}
                className={isResending ? "animate-spin" : ""}
              />

              {isResending ? "Sending OTP..." : "Resend OTP"}
            </button>

            {/* Countdown */}
            <div className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-gray-500">
              <Clock3 size={16} />

              {countdown > 0 ? (
                <span>
                  You can resend the OTP in{" "}
                  <span className="font-bold text-[#e87551]">
                    {String(countdown).padStart(2, "0")}s
                  </span>
                </span>
              ) : (
                <span>
                  Didn’t receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-bold text-[#e87551] hover:underline"
                  >
                    Resend now
                  </button>
                </span>
              )}
            </div>

            {/* Security Box */}
            <div className="mt-8 flex gap-4 rounded-2xl bg-[#f8f8f7] p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e4f1e9] text-[#4f8b73]">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-bold text-gray-800">
                  Your security matters
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Never share your OTP with anyone. Your information is kept
                  safe and secure.
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <LockKeyhole size={14} />
              Secure email verification
            </div>
          </div>
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
