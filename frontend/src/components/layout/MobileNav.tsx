import { NavLink } from "react-router";
import { navItems } from "@/shared/constants/navigation";

export function MobileNav() {
  return (
    <nav className="md:hidden flex border-t border-border bg-card shrink-0">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}
        >
          <item.icon size={18} />
          <span className="text-[10px]">{item.label.split(" ")[0]}</span>
          {item.badge && (
            <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 bg-accent rounded-full" />
          )}
        </NavLink>
      ))}
    </nav>
  );
}
