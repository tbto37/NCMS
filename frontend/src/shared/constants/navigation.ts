import type { ElementType } from "react";
import { Users, ShoppingCart, Layers } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: ElementType;
  path: string;
  badge?: number;
};

type NavItemDefinition = Omit<NavItem, "path"> & {
  route: string;
};

const navItemDefinitions: NavItemDefinition[] = [
  {
    id: "templates",
    label: "템플릿 관리",
    icon: Layers,
    route: "templates",
  },
  {
    id: "members",
    label: "회원 관리",
    icon: Users,
    route: "members",
    badge: 12,
  },
  {
    id: "orders",
    label: "주문 관리",
    icon: ShoppingCart,
    route: "orders",
    badge: 5,
  },
];

export function getLayoutBasePath(
  pathname: string,
  companyCode?: string,
): string {
  if (companyCode) {
    return `/${companyCode}`;
  }

  if (pathname === "/operator" || pathname.startsWith("/operator/")) {
    return "/operator";
  }

  return "/admin";
}

export function getNavItems(basePath: string): NavItem[] {
  const isCustomerSite = basePath !== "/admin" && basePath !== "/operator";
  const definitions = isCustomerSite
    ? navItemDefinitions
    : navItemDefinitions.filter((item) => item.id !== "templates");

  return definitions.map(({ route, ...item }) => ({
    ...item,
    path: `${basePath}/${route}`,
  }));
}
