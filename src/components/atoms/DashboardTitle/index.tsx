"use client";

import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard/admin": "Dashboard",
  "/dashboard/admin/transaksi": "Dashboard > Transaksi",
  "/dashboard/admin/orders": "Dashboard > Orders",
  "/dashboard/admin/products": "Dashboard > Products",
  "/dashboard/admin/users": "Dashboard > Users",
  "/dashboard/admin/analytics": "Analytics",
  "/dashboard/user": "Dashboard",
  "/dashboard/user/orders": "Dashboard > My Orders",
  "/dashboard/user/transactions": "Dashboard > Transactions",
  "/dashboard/user/profile": "Dashboard > Profile",
};

export default function DashboardTitle() {
  const pathname = usePathname();

  const title = titleMap[pathname] || "Dashboard";

  return <>{title}</>;
}