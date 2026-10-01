import { DashboardLayout as AdminDashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </ProtectedRoute>
  );
}
