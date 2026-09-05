import LayoutDashboard from "@/components/moleculs/LayoutDashboard";
import { AppSidebar } from "@/components/moleculs/AppSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <LayoutDashboard sidebar={<AppSidebar />}>
        {children}
      </LayoutDashboard>
  );
}
