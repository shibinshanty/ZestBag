import type { Metadata } from "next";
import "./globals.css";

import Providers from "../Providers";
import AppLayout from "../components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Zestbag",
  description: "Zestbag - Shop More. Live Brighter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}