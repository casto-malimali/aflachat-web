import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/components/admin/AuthContext";
import { ToastProvider } from "@/components/admin/ui";
import MuiThemeRegistry from "@/components/admin/MuiThemeRegistry";
import { LiveProvider } from "@/components/admin/LiveContext";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeRegistry>
      <AuthProvider>
        <ToastProvider>
          <LiveProvider>
            <AdminShell>{children}</AdminShell>
          </LiveProvider>
        </ToastProvider>
      </AuthProvider>
    </MuiThemeRegistry>
  );
}
