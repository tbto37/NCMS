import { NavLink, useLocation, useNavigate, useParams } from "react-router";
import { Package, X, LogOut } from "lucide-react";
import {
  getLayoutBasePath,
  getNavItems,
} from "@/shared/constants/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export function Sidebar({
  drawerOpen,
  collapsed = false,
  onClose,
  onOpenGuide,
}: {
  drawerOpen: boolean;
  collapsed?: boolean;
  onClose: () => void;
  onOpenGuide?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyCode } = useParams<{ companyCode?: string }>();
  const { logout, user } = useAuth();

  const sidebarTitle = user?.companyName?.trim() || "ADMIN";
  const siteCode = (companyCode || user?.companySiteCode || "").toLowerCase();
  const tenantLogo = siteCode === "cheil" ? "/logos/cheil_logo.png" : siteCode === "hanmi" ? "/logos/hanmi_logo.png" : "";

  const basePath = getLayoutBasePath(location.pathname, companyCode);
  const navItems = getNavItems(basePath, siteCode, user?.roles);

  function handleLogout() {
    logout();
    navigate(companyCode ? `/${companyCode}/login` : "/login", {
      replace: true,
    });
  }

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-40 shrink-0 bg-card border-r border-border flex flex-col
        transition-all duration-200
        ${collapsed ? "md:w-16 w-52" : "w-52"}
        ${drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-border h-12 ${collapsed ? "md:justify-center md:px-0" : ""}`}>
        {tenantLogo ? (
          collapsed ? (
            <img
              src={tenantLogo}
              alt={sidebarTitle}
              className="h-6 w-auto max-w-[36px] object-contain shrink-0 hidden md:block"
            />
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src={tenantLogo}
                alt={sidebarTitle}
                className="h-6 max-w-[135px] object-contain shrink-0"
              />
            </div>
          )
        ) : (
          <>
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center shrink-0">
              <Package size={13} className="text-primary-foreground" />
            </div>
            <span
              className={`text-xs font-semibold tracking-wide flex-1 truncate ${collapsed ? "md:hidden" : ""}`}
              title={sidebarTitle}
            >
              {sidebarTitle}
            </span>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="md:hidden text-muted-foreground hover:text-foreground shrink-0 ml-auto"
          aria-label="메뉴 닫기"
        >
          <X size={14} />
        </button>
      </div>

      <nav className="flex-1 py-3 space-y-1 px-2">
        {navItems.map((item) => {
          if (item.isModal) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onClose();
                  if (item.id === "guide" && onOpenGuide) {
                    onOpenGuide();
                  }
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 md:py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative ${
                  collapsed ? "md:justify-center md:px-0" : ""
                }`}
              >
                <item.icon size={16} className="shrink-0" />
                <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={({ isActive }: { isActive: boolean }) =>
                `w-full flex items-center gap-2.5 px-2.5 py-2.5 md:py-2 rounded-lg text-xs transition-colors relative ${
                  collapsed ? "md:justify-center md:px-0" : ""
                } ${active_(isActive)}`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <item.icon size={16} className="shrink-0" />
                  <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                  {item.badge && !collapsed && (
                    <span
                      className={`ml-auto text-xs font-mono px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-accent text-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "로그아웃" : undefined}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 md:py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${
            collapsed ? "md:justify-center md:px-0" : ""
          }`}
        >
          <LogOut size={15} className="shrink-0" />
          <span className={collapsed ? "md:hidden" : ""}>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}

function active_(isActive: boolean) {
  return isActive
    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
    : "text-muted-foreground hover:text-foreground hover:bg-secondary";
}
