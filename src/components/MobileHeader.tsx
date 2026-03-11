import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Search, User, LogOut, LayoutDashboard, X, Film, Tv, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { categories } from "@/data/categories";
import SearchResults from "./SearchResults";
import InstallAppButton from "./InstallAppButton";
import logo from "@/assets/logo.png";

const MobileHeader = () => {
  const { user, setShowAuthModal, setAuthModalTab, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const isHomePage = location.pathname === "/";
  const currentType = searchParams.get("type") || "movie";

  const handleTypeSwitch = (type: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", type);
    setSearchParams(params);
  };

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
    <header className="bg-card border-b border-border sticky top-0 z-50 md:hidden">
      <div className="flex items-center justify-between px-3 h-11">
        <Link to="/" className="flex items-center gap-1.5">
          <img src={logo} alt="LUO WATCH" className="w-6 h-6" />
          <span className="text-primary font-bold text-sm tracking-tight">LUO WATCH</span>
        </Link>
        <div className="flex items-center gap-2">
          {isHomePage && (
            <>
              <div className="flex bg-secondary rounded overflow-hidden">
                <button
                  onClick={() => handleTypeSwitch("movie")}
                  className={`flex items-center gap-0.5 px-2 py-1 text-[9px] font-bold transition-all ${
                    currentType === "movie" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Film className="w-2.5 h-2.5" /> Movies
                </button>
                <button
                  onClick={() => handleTypeSwitch("series")}
                  className={`flex items-center gap-0.5 px-2 py-1 text-[9px] font-bold transition-all ${
                    currentType === "series" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Tv className="w-2.5 h-2.5" /> Series
                </button>
              </div>
              <button onClick={() => { setShowCategories(!showCategories); setShowSearch(false); }} className="text-muted-foreground">
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          )}
          <button onClick={() => { setShowSearch(!showSearch); setShowCategories(false); }} className="text-muted-foreground">
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
          {user ? (
            <div className="flex items-center gap-1.5">
              {user.role !== "viewer" && (
                <button onClick={() => navigate(getDashboardPath())} className="text-muted-foreground">
                  <LayoutDashboard className="w-4 h-4" />
                </button>
              )}
              <button onClick={logout} className="text-muted-foreground">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthModalTab("login"); setShowAuthModal(true); }}
              className="bg-primary text-primary-foreground px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              Login
            </button>
          )}
        </div>
      </div>
      {showSearch && (
        <div className="px-3 pb-2">
          <SearchResults onClose={() => setShowSearch(false)} />
        </div>
      )}
      {showCategories && isHomePage && (
        <div className="px-3 pb-2 max-h-60 overflow-y-auto">
          <ul className="grid grid-cols-2 gap-1">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link
                  to={`/?genre=${encodeURIComponent(cat.name)}&type=${currentType}`}
                  onClick={() => setShowCategories(false)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded text-[10px] text-foreground hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;