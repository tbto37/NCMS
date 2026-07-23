import { useLocation } from "react-router";
import { Menu, Search, Bell } from "lucide-react";
import { navItems } from "@/shared/constants/navigation";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const location = useLocation();
  const currentNav = navItems.find((n) => n.path === location.pathname);

  return (
    <header className="h-12 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenu}
        className="md:hidden text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Menu size={16} />
      </button>

      {/* Current page label — mobile */}
      <span className="text-xs font-medium md:hidden">{currentNav?.label}</span>

      {/* Search — hidden on mobile, visible on sm+ */}
      <div className="relative hidden sm:block flex-1 max-w-xs">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="검색..."
          className="w-full pl-7 pr-3 py-1 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={15} />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
        <div className="flex items-center gap-2 border-l border-border pl-2 md:pl-3">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">K</div>
          <span className="text-xs font-medium hidden sm:block">김관리자</span>
        </div>
      </div>
    </header>
  );
}
