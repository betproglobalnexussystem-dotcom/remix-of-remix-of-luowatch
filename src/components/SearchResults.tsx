import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, Film, Music, Clapperboard, Loader2 } from "lucide-react";
import { searchContent, FireMovie, FireMusic, FireTikTok } from "@/lib/firestore";

interface SearchResultsProps {
  onClose?: () => void;
}

const SearchResults = ({ onClose }: SearchResultsProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ movies: FireMovie[]; music: FireMusic[]; tiktok: FireTikTok[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setShowResults(true);
    try {
      const res = await searchContent(query.trim());
      setResults(res);
    } catch {
      setResults({ movies: [], music: [], tiktok: [] });
    }
    setSearching(false);
  };

  const close = () => {
    setShowResults(false);
    setResults(null);
    setQuery("");
    onClose?.();
  };

  return (
    <div className="relative">
      <div className="relative flex gap-1">
        <div className="relative flex-1">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search movies, music..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-secondary text-foreground text-[11px] pl-6 pr-3 py-1.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary w-full"
            autoFocus
          />
        </div>
        <button onClick={handleSearch} className="bg-primary text-primary-foreground px-2.5 rounded text-[10px] font-semibold shrink-0">
          Search
        </button>
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <span className="text-foreground text-[11px] font-bold">Results: "{query}"</span>
            <button onClick={close}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>

          {searching && (
            <div className="flex items-center justify-center gap-1.5 p-4">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              <span className="text-muted-foreground text-[10px]">Searching...</span>
            </div>
          )}

          {results && !searching && (
            <div className="p-2 space-y-3">
              {results.movies.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-[9px] uppercase font-bold mb-1 flex items-center gap-1"><Film className="w-3 h-3" /> Movies</p>
                  {results.movies.map(m => (
                    <Link key={m.id} to={`/movie/${m.id}`} onClick={close} className="flex items-center gap-2 py-1 hover:bg-secondary rounded px-1">
                      {m.posterUrl && <img src={m.posterUrl} alt="" className="w-8 h-12 object-cover rounded" />}
                      <div>
                        <p className="text-foreground text-[10px] font-semibold">{m.title} ({m.year})</p>
                        <p className="text-muted-foreground text-[9px]">by {m.vjName} · {m.quality}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {results.music.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-[9px] uppercase font-bold mb-1 flex items-center gap-1"><Music className="w-3 h-3" /> Music</p>
                  {results.music.map(m => (
                    <Link key={m.id} to={`/music/${m.id}`} onClick={close} className="flex items-center gap-2 py-1 hover:bg-secondary rounded px-1">
                      {m.thumbnailUrl && <img src={m.thumbnailUrl} alt="" className="w-10 h-7 object-cover rounded" />}
                      <div>
                        <p className="text-foreground text-[10px] font-semibold">{m.title}</p>
                        <p className="text-muted-foreground text-[9px]">{m.artist}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {results.tiktok.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-[9px] uppercase font-bold mb-1 flex items-center gap-1"><Clapperboard className="w-3 h-3" /> TikTok</p>
                  {results.tiktok.map(t => (
                    <Link key={t.id} to="/tiktok" onClick={close} className="flex items-center gap-2 py-1 hover:bg-secondary rounded px-1">
                      <div>
                        <p className="text-foreground text-[10px] font-semibold">{t.title}</p>
                        <p className="text-muted-foreground text-[9px]">by {t.tiktokerName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {results.movies.length === 0 && results.music.length === 0 && results.tiktok.length === 0 && (
                <p className="text-muted-foreground text-[10px] text-center py-3">No results found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
