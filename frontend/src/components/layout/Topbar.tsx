import { useLocation, useParams } from "react-router";
import { Menu, Search, Bell } from "lucide-react";
import {
  getLayoutBasePath,
  getNavItems,
} from "@/shared/constants/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const location = useLocation();
  const { companyCode } = useParams<{ companyCode?: string }>();
  const { user } = useAuth();

  const basePath = getLayoutBasePath(location.pathname, companyCode);
  const navItems = getNavItems(basePath);
  const currentNav = navItems.find(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`),
  );

  const displayName = user?.name || "김관리자";
  const initial = displayName.trim().charAt(0) || "K";

  return (
    <header className="h-12 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
      <button
        type="button"
        onClick={onMenu}
        className="md:hidden text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="메뉴 열기"
      >
        <Menu size={16} />
      </button>

      <span className="text-xs font-medium md:hidden">
        {currentNav?.label}
      </span>

      <div className="relative hidden sm:block flex-1 max-w-xs">
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          placeholder="검색..."
          className="w-full pl-7 pr-3 py-1 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <button
          type="button"
          className="relative text-muted-foreground hover:text-foreground transition-colors"
          aria-label="알림"
        >
          <Bell size={15} />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
        <div className="flex items-center gap-2 border-l border-border pl-2 md:pl-3">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
            {initial}
          </div>
          <span className="text-xs font-medium hidden sm:block">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
