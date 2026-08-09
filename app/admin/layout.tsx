import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/components/admin/AuthContext";
import { ToastProvider } from "@/components/admin/ui";
import MuiThemeRegistry from "@/components/admin/MuiThemeRegistry";
import { LiveProvider } from "@/components/admin/LiveContext";

export const metadata: Metadata = {
  title: "Operations | AflaChat Admin",
  description: "Secure AflaChat operations, engagement and support dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeRegistry>
      <AuthProvider>
        <ToastProvider>
          <LiveProvider>
            <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-xl">Skip to dashboard content</a>
            <AdminShell>{children}</AdminShell>
          </LiveProvider>
        </ToastProvider>
      </AuthProvider>
    </MuiThemeRegistry>
  );
}
