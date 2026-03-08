import { ReactNode } from "react";
import AdminRouteTransition from "@/components/admin/route-transition";

export default function AdminDashboardTemplate({ children }: { children: ReactNode }) {
  return <AdminRouteTransition>{children}</AdminRouteTransition>;
}
