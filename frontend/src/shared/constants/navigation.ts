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
  { id: "templates", label: "템플릿 관리", icon: Layers, path: "/admin/templates" },
  { id: "members", label: "회원 관리", icon: Users, path: "/admin/members", badge: 12 },
  { id: "orders", label: "주문 관리", icon: ShoppingCart, path: "/admin/orders", badge: 5 },
];
