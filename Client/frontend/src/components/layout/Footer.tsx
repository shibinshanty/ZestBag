"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@mdi/react";

import {
  mdiShopping,
  mdiInstagram,
  mdiFacebook,
  mdiLinkedin,
  mdiTwitter,
  mdiArrowUpRight,
  mdiEmailOutline,
  mdiSend,
  mdiMapMarkerOutline,
  mdiPhoneOutline,
  mdiHeartOutline,
} from "@mdi/js";

const footerLinks = {
  shop: [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Cart", href: "/cart" },
    { name: "My Profile", href: "/profile" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Shipping Information", href: "/shipping" },
    { name: "Returns & Refunds", href: "/returns" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

const socialLinks = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: mdiInstagram,
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: mdiFacebook,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: mdiLinkedin,
  },
  {
    name: "X",
    href: "https://x.com",
    icon: mdiTwitter,
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#35152d] text-[#fff8f0]">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#f6b6a8]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#f6b6a8]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        {/* Main Footer Content */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-3"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6b6a8] text-[#35152d] shadow-lg">
                <Icon path={mdiShopping} size={1.4} />
              </span>

              <span className="text-2xl font-black tracking-tight">
                ZestBag
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-7 text-[#f4d8d2]/75">
              Discover your everyday style with carefully selected products
              made to add more zest to your life.
            </p>

            {/* Contact Details */}
            <div className="mt-6 space-y-3 text-sm text-[#f4d8d2]/80">
              <div className="flex items-center gap-3">
                <Icon
                  path={mdiMapMarkerOutline}
                  size={0.9}
                  className="text-[#f6b6a8]"
                />
                <span>Kerala, India</span>
              </div>

              <div className="flex items-center gap-3">
                <Icon
                  path={mdiEmailOutline}
                  size={0.9}
                  className="text-[#f6b6a8]"
                />
                <span>support@zestbag.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Icon
                  path={mdiPhoneOutline}
                  size={0.9}
                  className="text-[#f6b6a8]"
                />
                <span>+91 00004500</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-7 flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  whileHover={{ y: -4, scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f6b6a8]/25 bg-[#fff8f0]/5 text-[#f6b6a8] transition-colors hover:bg-[#f6b6a8] hover:text-[#35152d]"
                >
                  <Icon path={social.icon} size={0.95} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="mb-5 text-lg font-bold text-[#fff8f0]">
              Shop
            </h3>

            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-[#f4d8d2]/75 transition-colors hover:text-[#f6b6a8]"
                  >
                    <span>{link.name}</span>

                    <Icon
                      path={mdiArrowUpRight}
                      size={0.65}
                      className="opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="mb-5 text-lg font-bold text-[#fff8f0]">
              Support
            </h3>

            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-[#f4d8d2]/75 transition-colors hover:text-[#f6b6a8]"
                  >
                    <span>{link.name}</span>

                    <Icon
                      path={mdiArrowUpRight}
                      size={0.65}
                      className="opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="mb-5 text-lg font-bold text-[#fff8f0]">
              Stay Updated
            </h3>

            <p className="mb-5 text-sm leading-6 text-[#f4d8d2]/75">
              Subscribe to our newsletter and receive the latest updates,
              offers, and new arrivals.
            </p>

            <form className="space-y-3">
              <div className="relative">
                <Icon
                  path={mdiEmailOutline}
                  size={0.9}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#35152d]/60"
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-transparent bg-[#fff8f0] py-3 pl-11 pr-4 text-sm text-[#35152d] outline-none placeholder:text-[#35152d]/50 focus:border-[#f6b6a8]"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f6b6a8] px-5 py-3 text-sm font-bold text-[#35152d] transition-colors hover:bg-[#ffd0c5]"
              >
                <span>Subscribe</span>
                <Icon path={mdiSend} size={0.85} />
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-[#f6b6a8]/15" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-[#f4d8d2]/65 md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} ZestBag. All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            Made with
            <Icon
              path={mdiHeartOutline}
              size={0.75}
              className="text-[#f6b6a8]"
            />
            for better shopping
          </p>
        </div>
      </div>
    </footer>
  );
}