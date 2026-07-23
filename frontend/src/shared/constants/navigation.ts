import type { ElementType } from "react";
import { LayoutDashboard, Users, ShoppingCart, BarChart3, Settings, Layers } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: ElementType;
  path: string;
  badge?: number;
};

export const navItems: NavItem[] = [
  // { id: "dashboard", label: "대시보드", icon: LayoutDashboard, path: "/dashboard" },
  { id: "templates", label: "템플릿 관리", icon: Layers, path: "/templates" },
  { id: "orders", label: "주문 관리", icon: ShoppingCart, path: "/orders", badge: 5 },
  { id: "users", label: "사용자 관리", icon: Users, path: "/users", badge: 12 },
  // { id: "analytics", label: "분석", icon: BarChart3, path: "/analytics" },
  // { id: "settings", label: "설정", icon: Settings, path: "/settings" },
];
