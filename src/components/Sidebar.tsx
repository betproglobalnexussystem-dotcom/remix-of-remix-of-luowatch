import { useState } from "react";
import { categories } from "@/data/categories";
import { useMovies } from "@/hooks/useFirestore";
import { ChevronRight, Mail, Film, Tv } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ContactFloatBox from "./ContactFloatBox";

const Sidebar = () => {
  const { movies } = useMovies();
  const latestUpdates = movies.slice(0, 5);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentType = searchParams.get("type") || "movie";
  const [showContact, setShowContact] = useState(false);

  const handleTypeSwitch = (type: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", type);
    setSearchParams(params);
  };

  return (
    <aside className="w-full space-y-3">
      <div className="bg-card rounded p-3 border border-border">
        <h3 className="text-foreground text-xs font-bold mb-2">Contact or Report Us.</h3>
        <button onClick={() => setShowContact(true)} className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-1.5 rounded font-bold text-[11px] flex items-center gap-1.5 transition-colors mx-auto">
          <Mail className="w-3 h-3" />
          Contact Us
        </button>
      </div>
      <ContactFloatBox open={showContact} onClose={() => setShowContact(false)} />

      {/* Movies / Series Toggle */}
      <div className="bg-card rounded p-2 border border-border">
        <div className="flex gap-1">
          <button
            onClick={() => handleTypeSwitch("movie")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all ${
              currentType === "movie"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <Film className="w-3 h-3" />
            Movies
          </button>
          <button
            onClick={() => handleTypeSwitch("series")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all ${
              currentType === "series"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <Tv className="w-3 h-3" />
            Series
          </button>
        </div>
      </div>

      <div className="bg-card rounded p-3 border border-border">
        <h3 className="text-foreground text-xs font-bold mb-2">Latest Updates</h3>
        {latestUpdates.length === 0 ? (
          <p className="text-muted-foreground text-[10px]">No updates yet</p>
        ) : (
          <ul className="space-y-2">
            {latestUpdates.map((movie) => (
              <li key={movie.id}>
                <Link to={`/movie/${movie.id}`} className="flex gap-1.5 cursor-pointer group">
                  <div className="w-9 h-9 bg-secondary rounded flex-shrink-0 overflow-hidden">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                      {movie.title} ({movie.year}) · {movie.vjName}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{movie.genre} · {movie.quality}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-card rounded p-3 border border-border">
        <h3 className="text-foreground text-xs font-bold mb-2">Categories</h3>
        <ul className="space-y-0.5">
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link to={`/?genre=${encodeURIComponent(cat.name)}&type=${currentType}`} className="category-link text-[11px]">
                <ChevronRight className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                <span className="truncate">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
