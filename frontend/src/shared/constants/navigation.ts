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
  { id: "companies", label: "고객사 관리", icon: LayoutDashboard, path: "/admin/companies" },
  { id: "members", label: "회원 관리", icon: Users, path: "/admin/members", badge: 12 },
  { id: "templates", label: "템플릿 관리", icon: Layers, path: "/admin/templates" },
  { id: "products", label: "상품 설정", icon: Settings, path: "/admin/products" },
  { id: "audit-logs", label: "감사 로그", icon: BarChart3, path: "/admin/audit-logs" },
];
