import { NavLink, useNavigate } from "react-router";
import { Package, X, LogOut } from "lucide-react";
import { navItems } from "@/shared/constants/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export function Sidebar({ drawerOpen, onClose }: { drawerOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-40
        w-52 shrink-0 bg-card border-r border-border flex flex-col
        transition-transform duration-200
        ${drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border h-12">
        <div className="w-5 h-5 bg-primary rounded flex items-center justify-center shrink-0">
          <Package size={10} className="text-primary-foreground" />
        </div>
        <span className="text-xs font-semibold tracking-wide flex-1">ADMIN</span>
        <button
          onClick={onClose}
          className="md:hidden text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `w-full flex items-center gap-2.5 px-2.5 py-2.5 md:py-2 rounded text-xs transition-colors relative ${active_(isActive)}`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={14} className="shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-xs font-mono px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-foreground"}`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2.5 md:py-2 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut size={13} className="shrink-0" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}

function active_(isActive: boolean) {
  return isActive
    ? "bg-primary text-primary-foreground"
    : "text-muted-foreground hover:text-foreground hover:bg-secondary";
}
