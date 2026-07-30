import { useLocation, useParams } from "react-router";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  getLayoutBasePath,
  getNavItems,
} from "@/shared/constants/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export function Topbar({
  onMenu,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  onMenu: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
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

  const displayName = user?.name || "관리자";
  const initial = displayName.trim().charAt(0) || "A";

  return (
    <header className="h-12 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={onMenu}
        className="md:hidden text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="메뉴 열기"
      >
        <Menu size={16} />
      </button>

      {/* Desktop Sidebar Toggle / Expansion Button (검색 및 알림 제거 ➔ 확장 버튼 교체) */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="hidden md:flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shadow-xs"
        title={sidebarCollapsed ? "사이드바 펼치기" : "화면 넓게 보기 (사이드바 접기)"}
      >
        {sidebarCollapsed ? (
          <>
            <PanelLeftOpen size={16} />
            <span>메뉴 펼치기</span>
          </>
        ) : (
          <>
            <PanelLeftClose size={16} />
            <span>화면 넓게 보기</span>
          </>
        )}
      </button>

      <span className="text-xs font-semibold md:hidden text-foreground">
        {currentNav?.label}
      </span>

      {/* User Profile */}
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
            {initial}
          </div>
          <span className="text-xs font-semibold hidden sm:block text-foreground">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
