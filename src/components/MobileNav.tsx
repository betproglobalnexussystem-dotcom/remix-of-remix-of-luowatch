import { Link, useLocation } from "react-router-dom";
import { Film, Music, Tv, Gamepad2, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Movies", path: "/", icon: Film },
  { label: "Music", path: "/music", icon: Music },
  { label: "Live TV", path: "/live-tv", icon: Tv },
  { label: "Games", path: "/games", icon: Gamepad2 },
  { label: "TikTok", path: "/tiktok", icon: Clapperboard },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-[9px] font-semibold truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
