import { NavLink, useLocation, useParams } from "react-router";
import {
  getLayoutBasePath,
  getNavItems,
} from "@/shared/constants/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export function MobileNav({ onOpenGuide }: { onOpenGuide?: () => void }) {
  const location = useLocation();
  const { companyCode } = useParams<{ companyCode?: string }>();
  const { user } = useAuth();

  const siteCode = companyCode || user?.companySiteCode || undefined;
  const basePath = getLayoutBasePath(location.pathname, companyCode);
  const navItems = getNavItems(basePath, siteCode, user?.roles);

  return (
    <nav className="md:hidden flex border-t border-border bg-card shrink-0">
      {navItems.map((item) => {
        if (item.isModal) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "guide" && onOpenGuide) {
                  onOpenGuide();
                }
              }}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors text-muted-foreground hover:text-foreground"
            >
              <item.icon size={18} />
              <span className="text-[10px]">{item.label.split(" ")[0]}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-[10px]">{item.label.split(" ")[0]}</span>
            {item.badge && (
              <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 bg-accent rounded-full" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
