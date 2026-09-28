"use client";

import { usePathname } from "next/navigation";

import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin login page should not have sidebar
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="min-h-screen md:ml-64">
        {children}
      </main>
    </div>
  );
}