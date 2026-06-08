import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/components/admin/AuthContext";
import { ToastProvider } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </AuthProvider>
  );
}
