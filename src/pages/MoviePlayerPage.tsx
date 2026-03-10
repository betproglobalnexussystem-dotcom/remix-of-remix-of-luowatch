import { useParams } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import { useState, useEffect } from "react";
import { Share2, Download, Eye, Lock, Crown, LogIn } from "lucide-react";
import { useMovie, useEpisodes, useMovies } from "@/hooks/useFirestore";
import { incrementMovieViews, incrementMovieDownloads, logActivity, getMovieById } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import CommentSection from "@/components/CommentSection";
import ModernPlayer from "@/components/ModernPlayer";
import { toast } from "sonner";

const MoviePlayerPage = () => {
  const { id } = useParams();
  const { movie, loading } = useMovie(id || "");
  const { episodes } = useEpisodes(id || "");
  const { movies: relatedMovies } = useMovies();
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const { hasContentAccess, openSubModal } = useSubscription();
  const [activeEpisode, setActiveEpisode] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState<string | "all">("all");

  const canWatch = !!user && hasContentAccess;

  useEffect(() => {
    if (id) {
      incrementMovieViews(id).catch(() => {});
      if (user) {
        getMovieById(id).then(m => {
          if (m) logActivity({ type: "view", contentType: "movie", contentId: id, contentTitle: m.title, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
        });
      }
    }
  }, [id, user]);

  if (loading) return <LoadingScreen />;
  if (!movie) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Movie not found</div>;

  const isSeries = movie.type === "series";
  const seasons = isSeries ? [...new Set(episodes.map(ep => ep.season).filter(Boolean))].sort() : [];
  const filteredEpisodes = selectedSeason === "all" ? episodes : episodes.filter(ep => ep.season === selectedSeason);
  const videoUrl = isSeries && filteredEpisodes[activeEpisode]?.episodeUrl ? filteredEpisodes[activeEpisode].episodeUrl : movie.movieUrl;

  const getGDriveFileId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleDownload = () => {
    if (!user) { setAuthModalTab("login"); setShowAuthModal(true); return; }
    if (!hasContentAccess) { openSubModal("content"); return; }
    const url = movie.movieUrl || videoUrl;
    if (url) {
      incrementMovieDownloads(id!).catch(() => {});
      logActivity({ type: "download", contentType: "movie", contentId: id!, contentTitle: movie.title, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
      
      const fileId = getGDriveFileId(url);
      if (fileId) {
        const episodeTitle = isSeries && filteredEpisodes[activeEpisode]
          ? `${movie.title} - ${filteredEpisodes[activeEpisode].episodeTitle || `Episode ${filteredEpisodes[activeEpisode].episode}`}`
          : movie.title;
        const fileName = encodeURIComponent(`${episodeTitle}.mp4`);
        const downloadUrl = `https://black-band-8860.arthurdimpoz.workers.dev/download?fileId=${fileId}&fileName=${fileName}`;
        window.location.href = downloadUrl;
      } else {
        window.location.href = url;
      }
    } else {
      toast.error("No download link available");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (user) logActivity({ type: "share", contentType: "movie", contentId: id!, contentTitle: movie.title, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
    if (navigator.share) {
      try { await navigator.share({ title: movie.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handlePlayerClick = () => {
    if (!user) { setAuthModalTab("login"); setShowAuthModal(true); }
    else if (!hasContentAccess) { openSubModal("content"); }
  };

  const currentEpTitle = isSeries && filteredEpisodes[activeEpisode]
    ? `${movie.title} › ${filteredEpisodes[activeEpisode].episodeTitle || `Episode ${filteredEpisodes[activeEpisode].episode}`}`
    : movie.title;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex gap-4">
          <main className="flex-1 min-w-0">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-3">
              {canWatch && videoUrl ? (
                <ModernPlayer src={videoUrl} poster={movie.posterUrl} title={currentEpTitle} />
              ) : (
                <div className="relative w-full h-full cursor-pointer" onClick={handlePlayerClick}>
                  {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover opacity-30" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="backdrop-blur-sm rounded-xl px-6 py-5 flex flex-col items-center gap-2.5 max-w-[220px] w-full">
                      {!user ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                            <LogIn className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-foreground text-xs font-bold">Login to Watch</span>
                          <span className="text-muted-foreground text-[10px]">Sign in to access content</span>
                          <span className="mt-1 bg-primary text-primary-foreground text-[11px] font-bold px-5 py-1.5 rounded-lg">Login / Sign Up</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-foreground text-xs font-bold">Subscribe to Watch</span>
                          <span className="text-muted-foreground text-[10px]">From UGX 3,500/day</span>
                          <span className="mt-1 bg-primary text-primary-foreground text-[11px] font-bold px-5 py-1.5 rounded-lg">Subscribe Now</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-3 text-[11px] text-muted-foreground">
              <button onClick={handleShare} className="flex items-center gap-1 hover:text-foreground">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors font-semibold">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>

            {/* Title & Info */}
            <h1 className="text-foreground text-base font-bold mb-1">{currentEpTitle}</h1>
            <div className="flex items-center gap-2 mb-2 flex-wrap text-muted-foreground text-[10px]">
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {movie.views} views</span>
              <span>· {movie.downloads} downloads</span>
              <span>· {movie.year}</span>
              <span>· {movie.quality}</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-bold">{movie.vjName}</span>
              <span className="bg-secondary text-secondary-foreground text-[9px] px-1.5 py-0.5 rounded font-bold">{movie.type === "series" ? "Series" : "Movie"}</span>
              {movie.featured && <span className="bg-badge-featured text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-bold">Featured</span>}
            </div>

            {/* Genres */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              {movie.genre.split(",").map((g) => (
                <span key={g.trim()} className="bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded-full">{g.trim()}</span>
              ))}
            </div>

            {movie.description && (
              <p className="text-muted-foreground text-[11px] mb-4 leading-relaxed">{movie.description}</p>
            )}

            {/* Season Selector & Episode Grid */}
            {isSeries && episodes.length > 0 && (
              <div className="mb-4">
                {seasons.length > 1 && (
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-foreground text-xs font-bold mr-1">Season:</span>
                    <button onClick={() => { setSelectedSeason("all"); setActiveEpisode(0); }} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${selectedSeason === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>All</button>
                    {seasons.map(s => (
                      <button key={s} onClick={() => { setSelectedSeason(s); setActiveEpisode(0); }} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${selectedSeason === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>S{s}</button>
                    ))}
                  </div>
                )}
                <span className="text-foreground text-xs font-bold mb-2 block">Episodes ({filteredEpisodes.length})</span>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
                  {filteredEpisodes.map((ep, i) => (
                    <button
                      key={ep.id}
                      onClick={() => setActiveEpisode(i)}
                      className={`py-1.5 rounded text-[10px] font-bold transition-colors ${
                        i === activeEpisode ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                      }`}
                    >
                      {ep.episode || i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <CommentSection contentId={id || ""} contentType="movie" />
          </main>

          <aside className="w-56 flex-shrink-0 space-y-4 hidden md:block">
            <div className="bg-card rounded p-3 border border-border">
              <h3 className="text-foreground text-xs font-bold mb-2">More Movies</h3>
              <div className="space-y-2">
                {relatedMovies.filter(m => m.id !== id).slice(0, 8).map((m) => (
                  <a key={m.id} href={`/movie/${m.id}`} className="flex items-center gap-2 py-0.5 group">
                    {m.posterUrl && <img src={m.posterUrl} alt="" className="w-8 h-12 object-cover rounded" />}
                    <div className="min-w-0">
                      <p className="text-foreground text-[10px] font-semibold truncate group-hover:text-primary">{m.title}</p>
                      <p className="text-muted-foreground text-[9px]">{m.vjName}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MoviePlayerPage;
