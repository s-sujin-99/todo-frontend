import { AdminGuard } from "@/components/admin/admin-guard";
import { AuthGuard } from "@/components/auth-guard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AuthGuard>
      <AdminGuard>{children}</AdminGuard>
    </AuthGuard>
  );
}
