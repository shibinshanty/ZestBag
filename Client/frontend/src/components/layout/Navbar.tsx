"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";

import type { RootState, AppDispatch } from "../../store/store";
import { logout } from "../../store/slices/authSlice";
import { setCart, clearCart } from "../../store/slices/cartSlice";
import { getCart } from "../../services/cart.service";

import {
  Menu,
  X,
  ShoppingBag,
  UserRound,
  LogOut,
  ChevronDown,
  Home,
  Package,
  ShoppingCart,
  User,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, isAuthenticated, authInitialized } = useSelector(
    (state: RootState) => state.auth,
  );

  const cart = useSelector((state: RootState) => state.cart.cart);

  /*
   * Load cart from backend after authentication is initialized.
   * This runs again after refreshing the page when the user is logged in.
   */
  useEffect(() => {
    const fetchCart = async () => {
      if (!authInitialized || !isAuthenticated || !user) {
        return;
      }

      try {
        const cartData = await getCart();

        // console.log("Navbar cart data:", cartData);

        dispatch(setCart(cartData));
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    fetchCart();
  }, [authInitialized, isAuthenticated, user, dispatch]);

  const cartItemCount =
    cart?.items?.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    ) || 0;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch(logout());
    dispatch(clearCart());

    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    router.push("/");
  };

  const navLinks = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Products",
      href: "/products",
      icon: Package,
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      badge: cartItemCount,
    },
  ];

  const isLoggedIn = isAuthenticated && !!user;

  return (
    <nav className="sticky top-0 z-50 border-b border-[#ead9e2]/80 bg-[#fffaf7]/95 shadow-[0_5px_25px_rgba(91,43,63,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#741747] text-white shadow-lg shadow-[#741747]/20"
          >
            <ShoppingBag size={23} strokeWidth={2.2} />
          </motion.div>

          <div>
            <div className="text-2xl font-extrabold tracking-tight text-[#571437]">
              Zest<span className="text-[#e87551]">Bag</span>
            </div>

            <p className="hidden text-[10px] font-medium tracking-[0.15em] text-gray-500 sm:block">
              SHOP SMART. LIVE BETTER.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#f9e8df] text-[#741747]"
                    : "text-[#3b2934] hover:bg-[#fff0e9] hover:text-[#741747]"
                }`}
              >
                <Icon
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5"
                />

                {item.label}

                {item.badge && item.badge > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e87551] px-1.5 text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}

                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#e87551]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-3 lg:flex">
          {!authInitialized ? (
            <div className="h-12 w-32 animate-pulse rounded-full bg-[#f9e8df]" />
          ) : isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 rounded-full border border-[#ead9e2] bg-white px-3 py-2 transition hover:border-[#d9b7c8] hover:shadow-md"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbd8c9] text-[#741747]">
                  <UserRound size={18} />
                </div>

                <div className="max-w-[130px] text-left">
                  <p className="truncate text-sm font-bold text-[#571437]">
                    {user.name}
                  </p>

                  <p className="text-[11px] text-gray-500">My Account</p>
                </div>

                <ChevronDown
                  size={17}
                  className={`text-gray-400 transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.96,
                    }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-16 w-56 overflow-hidden rounded-2xl border border-[#ead9e2] bg-white p-2 shadow-[0_20px_60px_rgba(91,43,63,0.15)]"
                  >
                    <div className="border-b border-gray-100 px-3 py-3">
                      <p className="text-xs text-gray-500">Signed in as</p>

                      <p className="mt-1 truncate text-sm font-bold text-[#571437]">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#fff1ec] hover:text-[#741747]"
                    >
                      <User size={17} />
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#fff1ec] hover:text-[#741747]"
                    >
                      <ClipboardList size={17} />
                      My Orders
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-full bg-[#741747] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#741747]/20 transition hover:bg-[#5b1036]"
            >
              Login
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#741747] shadow-sm ring-1 ring-[#ead9e2] transition hover:bg-[#fff0e9] lg:hidden"
          aria-label={
            isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[#ead9e2] bg-white lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-2 px-5 py-5 sm:px-6">
              {navLinks.map((item, index) => {
                const Icon = item.icon;

                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.06,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#fff0e9] text-[#741747]"
                          : "text-gray-700 hover:bg-[#fff8f3]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={19} />
                        {item.label}
                      </span>

                      {item.badge && item.badge > 0 ? (
                        <span className="rounded-full bg-[#e87551] px-2 py-1 text-xs font-bold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="my-3 h-px bg-gray-100" />

              {!authInitialized ? (
                <div className="h-20 animate-pulse rounded-2xl bg-[#fff8f3]" />
              ) : isLoggedIn ? (
                <>
                  {/* Mobile User Information */}
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fff8f3] p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbd8c9] text-[#741747]">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#571437]">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Profile Link */}
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-[#fff8f3]"
                  >
                    <User size={19} />
                    My Profile
                  </Link>

                  {/* Mobile Orders Link */}
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-[#fff8f3]"
                  >
                    <ClipboardList size={19} />
                    My Orders
                  </Link>

                  {/* Mobile Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={19} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#741747] px-5 py-3.5 text-sm font-bold text-white"
                >
                  Login
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
