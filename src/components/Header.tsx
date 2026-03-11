import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import SearchResults from "./SearchResults";
import InstallAppButton from "./InstallAppButton";
import logo from "@/assets/logo.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setShowAuthModal, setAuthModalTab, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "vj": return "/vj-dashboard";
      case "musician": return "/musician-dashboard";
      case "tiktoker": return "/tiktoker-dashboard";
      default: return "/";
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center justify-between h-10">
          <Link to="/" className="flex items-center gap-1.5">
            <img src={logo} alt="LUO WATCH" className="w-6 h-6" />
            <span className="text-primary font-bold text-sm tracking-tight">LUO WATCH</span>
          </Link>
          <nav className="flex items-center gap-0.5">
            {[
              { label: "Movies", path: "/" },
              { label: "Music", path: "/music" },
              { label: "Live TV", path: "/live-tv" },
              { label: "Games", path: "/games" },
              { label: "Acholi TikTok", path: "/tiktok" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <SearchResults />
            {user ? (
              <div className="flex items-center gap-1.5">
                {(user.email === "luowatch0@gmail.com" || user.email === "mainplatform.nexus@gmail.com") && (
                  <button onClick={() => navigate("/admin")} className="bg-primary/20 text-primary px-2 py-1 rounded text-[10px] font-semibold hover:bg-primary/30 transition-colors flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </button>
                )}
                {user.role !== "viewer" && (
                  <button onClick={() => navigate(getDashboardPath())} className="bg-secondary text-foreground px-2 py-1 rounded text-[10px] font-semibold hover:bg-secondary/80 transition-colors flex items-center gap-1">
                    <LayoutDashboard className="w-3 h-3" /> Dashboard
                  </button>
                )}
                <span className="text-foreground text-[10px] font-semibold">{user.firstName}</span>
                <button onClick={logout} className="text-muted-foreground hover:text-foreground transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthModalTab("login"); setShowAuthModal(true); }} className="bg-primary text-primary-foreground px-3 py-1 rounded text-[11px] font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1">
                <User className="w-3 h-3" /> Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
