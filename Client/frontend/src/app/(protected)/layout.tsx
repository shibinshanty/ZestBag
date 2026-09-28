"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [authenticated] = useState<boolean>(() => {
    return isAuthenticated();
  });

  useEffect(() => {
    if (!authenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname)}`
      );
    }
  }, [authenticated, pathname, router]);

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}