import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Upload, Film, Tv, List, Wallet, ArrowDownToLine,
  Receipt, Eye, Download, ChevronLeft, Plus, TrendingUp,
  DollarSign, BarChart3, Trash2, Edit2, X, Check, FolderPlus, Loader2
} from "lucide-react";
import { sendWithdrawal, formatPhone } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useVJMovies } from "@/hooks/useFirestore";
import { addMovie, deleteMovie, updateMovie, addEpisode, deleteEpisode, updateEpisode, getEpisodesByVJ, FireEpisode } from "@/lib/firestore";
import { subscribeCreatorEarning, getCreatorTransactions, recordWithdrawal, getOrCreateEarning, CreatorEarning, EarningTransaction } from "@/lib/earnings";
import { genreList } from "@/data/categories";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "upload-movie", label: "Upload Movies", icon: Upload },
  { id: "upload-series", label: "Upload Series", icon: Tv },
  { id: "upload-episode", label: "Upload Episode", icon: Film },
  { id: "featured", label: "Featured", icon: TrendingUp },
  { id: "manage-content", label: "Manage Content", icon: List },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

const VJDashboard = () => {
  const { user } = useAuth();
  const { movies, loading: moviesLoading } = useVJMovies(user?.id || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [manageSubTab, setManageSubTab] = useState<"movies" | "series">("movies");
  const [episodes, setEpisodes] = useState<FireEpisode[]>([]);

  // Earnings from Firestore
  const [earning, setEarning] = useState<CreatorEarning | null>(null);
  const [transactions, setTransactions] = useState<EarningTransaction[]>([]);

  // Movie form
  const [mTitle, setMTitle] = useState("");
  const [mYear, setMYear] = useState("");
  const [mGenre, setMGenre] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mPosterUrl, setMPosterUrl] = useState("");
  const [mMovieUrl, setMMovieUrl] = useState("");

  // Series form
  const [sTitle, setSTitle] = useState("");
  const [sYear, setSYear] = useState("");
  const [sGenre, setSGenre] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sPosterUrl, setSPosterUrl] = useState("");

  // Episode form
  const [eMovieId, setEMovieId] = useState("");
  const [eSeriesTitle, setESeriesTitle] = useState("");
  const [eSeason, setESeason] = useState("");
  const [eEpisode, setEEpisode] = useState("");
  const [eEpisodeTitle, setEEpisodeTitle] = useState("");
  const [eEpisodeUrl, setEEpisodeUrl] = useState("");

  // Edit states
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [editMovie, setEditMovie] = useState({ title: "", year: "", genre: "", description: "", posterUrl: "", movieUrl: "" });
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [editSeries, setEditSeries] = useState({ title: "", year: "", genre: "", description: "", posterUrl: "" });
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [editEp, setEditEp] = useState({ season: "", episode: "", episodeTitle: "", episodeUrl: "" });

  const [managingSeriesId, setManagingSeriesId] = useState<string | null>(null);
  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Wallet
  const [wPhone, setWPhone] = useState("");
  const [wAmount, setWAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getEpisodesByVJ(user.id).then(setEpisodes).catch(() => {});
      // Initialize earning record
      getOrCreateEarning(user.id, `${user.firstName} ${user.lastName}`.trim() || user.email, "vj").catch(() => {});
      // Subscribe to real-time earnings
      const unsub = subscribeCreatorEarning(user.id, setEarning);
      // Load transactions
      getCreatorTransactions(user.id).then(setTransactions).catch(() => {});
      return unsub;
    }
  }, [user?.id]);

  const refreshEpisodes = async () => {
    if (user?.id) {
      const eps = await getEpisodesByVJ(user.id);
      setEpisodes(eps);
    }
  };

  const handleUploadMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle) { toast.error("Title is required"); return; }
    if (!mMovieUrl) { toast.error("Movie link is required"); return; }
    if (!user) return;
    setIsUploading(true);
    try {
      await addMovie({
        title: mTitle, year: mYear, quality: "1080p", genre: mGenre,
        description: mDesc, posterUrl: mPosterUrl, movieUrl: mMovieUrl, downloadUrl: "",
        featured: false, type: "movie", vjId: user.id,
        vjName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      });
      setMTitle(""); setMYear(""); setMGenre(""); setMDesc(""); setMPosterUrl(""); setMMovieUrl("");
      toast.success("Movie uploaded!");
    } catch (err: any) { toast.error("Upload failed: " + (err.message || "Unknown error")); }
    setIsUploading(false);
  };

  const handleUploadSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sTitle) { toast.error("Title is required"); return; }
    if (!user) return;
    try {
      await addMovie({
        title: sTitle, year: sYear, quality: "1080p", genre: sGenre,
        description: sDesc, posterUrl: sPosterUrl, movieUrl: "", downloadUrl: "",
        featured: false, type: "series", vjId: user.id,
        vjName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      });
      setSTitle(""); setSYear(""); setSGenre(""); setSDesc(""); setSPosterUrl("");
      toast.success("Series created! Now add episodes from Manage Content.");
    } catch (err: any) { toast.error("Upload failed: " + (err.message || "Unknown error")); }
  };

  const handleDeleteMovie = async (id: string) => {
    try { await deleteMovie(id); toast.success("Deleted"); } catch { toast.error("Delete failed"); }
  };

  const handleSaveEditMovie = async (id: string) => {
    try { await updateMovie(id, { ...editMovie }); setEditingMovieId(null); toast.success("Updated!"); } catch { toast.error("Update failed"); }
  };

  const handleSaveEditSeries = async (id: string) => {
    try { await updateMovie(id, { ...editSeries }); setEditingSeriesId(null); toast.success("Updated!"); } catch { toast.error("Update failed"); }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try { await updateMovie(id, { featured: !current }); } catch { toast.error("Update failed"); }
  };

  const handleUploadEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    const seriesId = showAddEpisode ? managingSeriesId : eMovieId;
    const seriesTitle = showAddEpisode ? (seriesMovies.find(s => s.id === seriesId)?.title || "") : eSeriesTitle;
    if (!seriesId) { toast.error("Please select a series first"); return; }
    if (!eEpisodeUrl || !eEpisodeUrl.trim()) { toast.error("Episode link is required"); return; }
    if (!user) { toast.error("You must be logged in"); return; }
    setIsUploading(true);
    try {
      const episodeData = {
        movieId: seriesId,
        seriesTitle: seriesTitle || "",
        season: (eSeason || "").trim() || "1",
        episode: (eEpisode || "").trim() || "1",
        episodeTitle: (eEpisodeTitle || "").trim() || `Episode ${(eEpisode || "").trim() || "1"}`,
        episodeUrl: eEpisodeUrl.trim(),
        vjId: user.id,
      };
      console.log("Uploading episode:", episodeData);
      await addEpisode(episodeData);
      setESeason(""); setEEpisode(""); setEEpisodeTitle(""); setEEpisodeUrl(""); setEMovieId(""); setESeriesTitle("");
      setShowAddEpisode(false);
      await refreshEpisodes();
      toast.success("Episode uploaded successfully!");
    } catch (err: any) {
      console.error("Episode upload error:", err);
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    }
    setIsUploading(false);
  };

  const handleDeleteEpisode = async (id: string) => {
    try { await deleteEpisode(id); await refreshEpisodes(); toast.success("Episode deleted"); } catch { toast.error("Delete failed"); }
  };

  const handleSaveEditEpisode = async (id: string) => {
    try { await updateEpisode(id, { ...editEp }); setEditingEpisodeId(null); await refreshEpisodes(); toast.success("Episode updated!"); } catch { toast.error("Update failed"); }
  };

  // Earnings from Firestore (real data)
  const totalDownloads = earning?.totalDownloads || 0;
  const totalEarned = earning?.totalEarned || 0;
  const totalWithdrawn = earning?.totalWithdrawn || 0;
  const balance = earning?.balance || 0;

  const now = new Date();
  const isSaturday = now.getDay() === 6;
  const hour = now.getHours();
  const isWithdrawWindow = isSaturday && hour >= 12 && hour < 24;

  const formatUGX = (n: number) => `UGX ${n.toLocaleString()}`;

  const stats = [
    { label: "Total Movies", value: String(movies.length), icon: Film, color: "text-primary" },
    { label: "Total Views", value: String(movies.reduce((s, m) => s + (m.views || 0), 0)), icon: Eye, color: "text-badge-hd" },
    { label: "Confirmed Downloads", value: String(totalDownloads), icon: Download, color: "text-badge-new" },
    { label: "Balance", value: formatUGX(balance), icon: DollarSign, color: "text-accent" },
  ];

  const onlyMovies = movies.filter(m => m.type === "movie");
  const seriesMovies = movies.filter(m => m.type === "series");
  const managingSeriesEpisodes = episodes.filter(ep => ep.movieId === managingSeriesId);
  const inputCls = "w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary";

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWithdrawWindow) { toast.error("Withdrawals only on Saturday 12 PM – Midnight"); return; }
    if (!wAmount || Number(wAmount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (Number(wAmount) > balance) { toast.error("Cannot withdraw more than your balance"); return; }
    if (!wPhone) { toast.error("Enter phone number"); return; }
    if (!user) return;
    setWithdrawing(true);
    try {
      const res = await sendWithdrawal(formatPhone(wPhone), Number(wAmount), "VJ earnings withdrawal");
      if (res.success) {
        await recordWithdrawal(user.id, `${user.firstName} ${user.lastName}`.trim() || user.email, Number(wAmount), formatPhone(wPhone), "completed");
        toast.success(`Withdrawal of ${formatUGX(Number(wAmount))} initiated!`);
        setWAmount(""); setWPhone("");
        // Refresh transactions
        getCreatorTransactions(user.id).then(setTransactions).catch(() => {});
      } else {
        toast.error(res.message || "Withdrawal failed");
      }
    } catch { toast.error("Withdrawal failed"); }
    setWithdrawing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-48 bg-card border-r border-border min-h-screen flex-shrink-0 hidden md:block">
          <div className="p-3 border-b border-border">
            <Link to="/" className="text-primary text-xs font-bold flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Back to LUO WATCH</Link>
          </div>
          <div className="p-2">
            <p className="text-[9px] text-muted-foreground uppercase font-bold px-2 mb-2">VJ Dashboard</p>
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-semibold transition-colors mb-0.5", activeTab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
                <item.icon className="w-3.5 h-3.5" />{item.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="md:hidden fixed top-11 left-0 right-0 z-40 bg-card border-b border-border overflow-x-auto">
          <div className="flex gap-1 p-2">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap", activeTab === item.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                <item.icon className="w-3 h-3" />{item.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 mt-10 md:mt-0 mb-14 md:mb-0">
          {/* ====== OVERVIEW ====== */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Overview</h2>
              <div className="bg-card border border-border rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground text-[11px] font-bold">💰 Earnings Status (UGX 250 per confirmed download)</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
                  <div><p className="text-[9px] text-muted-foreground">Confirmed Downloads</p><p className="text-foreground text-xs font-bold">{totalDownloads}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">Earned</p><p className="text-foreground text-xs font-bold">{formatUGX(totalEarned)}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">Withdrawn</p><p className="text-foreground text-xs font-bold">{formatUGX(totalWithdrawn)}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">Balance</p><p className="text-primary text-xs font-bold">{formatUGX(balance)}</p></div>
                </div>
                <p className="text-[9px] text-muted-foreground mt-2">Only downloads by paying subscribers count. VJ/admin/artist downloads are excluded.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {stats.map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2"><s.icon className={cn("w-4 h-4", s.color)} /><BarChart3 className="w-3 h-3 text-muted-foreground" /></div>
                    <p className="text-foreground text-base font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <h3 className="text-foreground text-xs font-bold mb-2">Recent Uploads</h3>
              {movies.length === 0 ? <p className="text-muted-foreground text-xs">No content uploaded yet.</p> : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead><tr className="border-b border-border">
                      <th className="text-left text-muted-foreground font-semibold p-2">Title</th>
                      <th className="text-left text-muted-foreground font-semibold p-2">Type</th>
                      <th className="text-left text-muted-foreground font-semibold p-2">Views</th>
                    </tr></thead>
                    <tbody>
                      {movies.slice(0, 5).map((m) => (
                        <tr key={m.id} className="border-b border-border last:border-0">
                          <td className="p-2 text-foreground font-semibold">{m.title}</td>
                          <td className="p-2"><span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold", m.type === "series" ? "bg-accent text-accent-foreground" : "bg-badge-new text-primary-foreground")}>{m.type === "series" ? "Series" : "Movie"}</span></td>
                          <td className="p-2 text-muted-foreground">{m.views}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ====== UPLOAD MOVIES ====== */}
          {activeTab === "upload-movie" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Upload Movie</h2>
              <div className="bg-card border border-border rounded-lg p-4 max-w-lg">
                <form className="space-y-3" onSubmit={handleUploadMovie}>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Title *</label><input className={inputCls} placeholder="Enter movie title" value={mTitle} onChange={e => setMTitle(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Year</label><input className={inputCls} placeholder="2026" value={mYear} onChange={e => setMYear(e.target.value)} /></div>
                    <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Genre</label>
                      <select className={inputCls} value={mGenre} onChange={e => setMGenre(e.target.value)}>
                        <option value="">Select genre</option>
                        {genreList.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Description</label><textarea className={`${inputCls} h-20 resize-none`} placeholder="Description..." value={mDesc} onChange={e => setMDesc(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Poster Image URL</label><input className={inputCls} placeholder="Paste poster image URL..." value={mPosterUrl} onChange={e => setMPosterUrl(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Movie Link *</label><input className={inputCls} placeholder="Paste movie/stream link..." value={mMovieUrl} onChange={e => setMMovieUrl(e.target.value)} /></div>
                  <button type="submit" disabled={isUploading} className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                    {isUploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</> : <><Plus className="w-3.5 h-3.5" /> Upload Movie</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ====== UPLOAD SERIES ====== */}
          {activeTab === "upload-series" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Create New Series</h2>
              <p className="text-muted-foreground text-[10px] mb-3">Create a series first, then add episodes from "Upload Episode" tab.</p>
              <div className="bg-card border border-border rounded-lg p-4 max-w-lg">
                <form className="space-y-3" onSubmit={handleUploadSeries}>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Series Title *</label><input className={inputCls} placeholder="Enter series title" value={sTitle} onChange={e => setSTitle(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Year</label><input className={inputCls} placeholder="2026" value={sYear} onChange={e => setSYear(e.target.value)} /></div>
                    <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Genre</label>
                      <select className={inputCls} value={sGenre} onChange={e => setSGenre(e.target.value)}>
                        <option value="">Select genre</option>
                        {genreList.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Description</label><textarea className={`${inputCls} h-20 resize-none`} placeholder="Description..." value={sDesc} onChange={e => setSDesc(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Poster Image URL</label><input className={inputCls} placeholder="https://..." value={sPosterUrl} onChange={e => setSPosterUrl(e.target.value)} /></div>
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Create Series</button>
                </form>
              </div>
            </div>
          )}

          {/* ====== UPLOAD EPISODE ====== */}
          {activeTab === "upload-episode" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Upload Episode</h2>
              <p className="text-muted-foreground text-[10px] mb-3">Select a series and add an episode to it.</p>
              <div className="bg-card border border-border rounded-lg p-4 max-w-lg">
                {seriesMovies.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-xs mb-2">No series created yet.</p>
                    <button onClick={() => setActiveTab("upload-series")} className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-[10px] font-bold hover:bg-primary/90">Create a Series First</button>
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={handleUploadEpisode}>
                    <div>
                      <label className="text-foreground text-[11px] font-semibold mb-1 block">Select Series *</label>
                      <select className={inputCls} value={eMovieId} onChange={e => { setEMovieId(e.target.value); setESeriesTitle(seriesMovies.find(s => s.id === e.target.value)?.title || ""); }}>
                        <option value="">Choose a series...</option>
                        {seriesMovies.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Season *</label><input className={inputCls} placeholder="1" value={eSeason} onChange={e => setESeason(e.target.value)} /></div>
                      <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Episode *</label><input className={inputCls} placeholder="1" value={eEpisode} onChange={e => setEEpisode(e.target.value)} /></div>
                      <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Ep. Title</label><input className={inputCls} placeholder="Title" value={eEpisodeTitle} onChange={e => setEEpisodeTitle(e.target.value)} /></div>
                    </div>
                    <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Episode Video Link *</label><input className={inputCls} placeholder="Paste video link (Google Drive, etc.)" value={eEpisodeUrl} onChange={e => setEEpisodeUrl(e.target.value)} /></div>
                    <button type="submit" disabled={isUploading} className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                      {isUploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</> : <><Plus className="w-3.5 h-3.5" /> Upload Episode</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === "featured" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Featured</h2>
              <p className="text-muted-foreground text-xs mb-4">Toggle content to appear on homepage.</p>
              {movies.length === 0 ? <p className="text-muted-foreground text-xs">No content to feature.</p> : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead><tr className="border-b border-border">
                      <th className="text-left text-muted-foreground font-semibold p-2">Title</th>
                      <th className="text-left text-muted-foreground font-semibold p-2">Type</th>
                      <th className="text-left text-muted-foreground font-semibold p-2">Featured</th>
                    </tr></thead>
                    <tbody>
                      {movies.map((m) => (
                        <tr key={m.id} className="border-b border-border last:border-0">
                          <td className="p-2 text-foreground font-semibold">{m.title}</td>
                          <td className="p-2 text-muted-foreground capitalize">{m.type}</td>
                          <td className="p-2"><input type="checkbox" checked={m.featured} onChange={() => toggleFeatured(m.id, m.featured)} className="accent-primary" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ====== MANAGE CONTENT ====== */}
          {activeTab === "manage-content" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-3">Manage Content</h2>
              <div className="flex gap-1 mb-4">
                <button onClick={() => { setManageSubTab("movies"); setManagingSeriesId(null); }} className={cn("px-3 py-1.5 rounded text-[11px] font-bold transition-colors", manageSubTab === "movies" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                  <Film className="w-3 h-3 inline mr-1" />Movies
                </button>
                <button onClick={() => { setManageSubTab("series"); setManagingSeriesId(null); }} className={cn("px-3 py-1.5 rounded text-[11px] font-bold transition-colors", manageSubTab === "series" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                  <Tv className="w-3 h-3 inline mr-1" />Series
                </button>
              </div>

              {manageSubTab === "movies" && (
                <div>
                  {onlyMovies.length === 0 ? <p className="text-muted-foreground text-xs">No movies yet.</p> : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-[11px]">
                        <thead><tr className="border-b border-border">
                          <th className="text-left text-muted-foreground font-semibold p-2">Title</th>
                          <th className="text-left text-muted-foreground font-semibold p-2">Year</th>
                          <th className="text-left text-muted-foreground font-semibold p-2">Genre</th>
                          <th className="text-left text-muted-foreground font-semibold p-2">Actions</th>
                        </tr></thead>
                        <tbody>
                          {onlyMovies.map((m) => (
                            <tr key={m.id} className="border-b border-border last:border-0">
                              {editingMovieId === m.id ? (
                                <>
                                  <td className="p-2"><input className={inputCls} value={editMovie.title} onChange={e => setEditMovie({ ...editMovie, title: e.target.value })} /></td>
                                  <td className="p-2"><input className={inputCls} value={editMovie.year} onChange={e => setEditMovie({ ...editMovie, year: e.target.value })} /></td>
                                  <td className="p-2"><input className={inputCls} value={editMovie.genre} onChange={e => setEditMovie({ ...editMovie, genre: e.target.value })} /></td>
                                  <td className="p-2 flex gap-1">
                                    <button onClick={() => handleSaveEditMovie(m.id)} className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Save</button>
                                    <button onClick={() => setEditingMovieId(null)} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded"><X className="w-2.5 h-2.5" /></button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-2 text-foreground font-semibold">{m.title}</td>
                                  <td className="p-2 text-muted-foreground">{m.year}</td>
                                  <td className="p-2 text-muted-foreground">{m.genre}</td>
                                  <td className="p-2 flex gap-1">
                                    <button onClick={() => { setEditingMovieId(m.id); setEditMovie({ title: m.title, year: m.year, genre: m.genre, description: m.description, posterUrl: m.posterUrl, movieUrl: m.movieUrl }); }} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Edit2 className="w-2.5 h-2.5" /> Edit</button>
                                    <button onClick={() => handleDeleteMovie(m.id)} className="text-[9px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Trash2 className="w-2.5 h-2.5" /> Delete</button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {manageSubTab === "series" && !managingSeriesId && (
                <div>
                  {seriesMovies.length === 0 ? <p className="text-muted-foreground text-xs">No series yet.</p> : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-[11px]">
                        <thead><tr className="border-b border-border">
                          <th className="text-left text-muted-foreground font-semibold p-2">Title</th>
                          <th className="text-left text-muted-foreground font-semibold p-2">Year</th>
                          <th className="text-left text-muted-foreground font-semibold p-2">Episodes</th>
                          <th className="text-left text-muted-foreground font-semibold p-2">Actions</th>
                        </tr></thead>
                        <tbody>
                          {seriesMovies.map((m) => {
                            const epCount = episodes.filter(ep => ep.movieId === m.id).length;
                            return (
                              <tr key={m.id} className="border-b border-border last:border-0">
                                {editingSeriesId === m.id ? (
                                  <>
                                    <td className="p-2"><input className={inputCls} value={editSeries.title} onChange={e => setEditSeries({ ...editSeries, title: e.target.value })} /></td>
                                    <td className="p-2"><input className={inputCls} value={editSeries.year} onChange={e => setEditSeries({ ...editSeries, year: e.target.value })} /></td>
                                    <td className="p-2 text-muted-foreground">{epCount}</td>
                                    <td className="p-2 flex gap-1">
                                      <button onClick={() => handleSaveEditSeries(m.id)} className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Save</button>
                                      <button onClick={() => setEditingSeriesId(null)} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded"><X className="w-2.5 h-2.5" /></button>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="p-2 text-foreground font-semibold">{m.title}</td>
                                    <td className="p-2 text-muted-foreground">{m.year}</td>
                                    <td className="p-2 text-muted-foreground">{epCount}</td>
                                    <td className="p-2 flex gap-1 flex-wrap">
                                      <button onClick={() => { setEditingSeriesId(m.id); setEditSeries({ title: m.title, year: m.year, genre: m.genre, description: m.description, posterUrl: m.posterUrl }); }} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Edit2 className="w-2.5 h-2.5" /> Edit</button>
                                      <button onClick={() => handleDeleteMovie(m.id)} className="text-[9px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Trash2 className="w-2.5 h-2.5" /> Delete</button>
                                      <button onClick={() => setManagingSeriesId(m.id)} className="text-[9px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><FolderPlus className="w-2.5 h-2.5" /> Episodes</button>
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {manageSubTab === "series" && managingSeriesId && (
                <div>
                  <button onClick={() => { setManagingSeriesId(null); setShowAddEpisode(false); }} className="text-primary text-[11px] font-bold flex items-center gap-1 mb-3"><ChevronLeft className="w-3 h-3" /> Back to Series</button>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-foreground text-xs font-bold">Episodes — {seriesMovies.find(s => s.id === managingSeriesId)?.title}</h3>
                    <button onClick={() => setShowAddEpisode(!showAddEpisode)} className="text-[10px] bg-primary text-primary-foreground px-2.5 py-1 rounded font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Episode</button>
                  </div>

                  {showAddEpisode && (
                    <div className="bg-card border border-border rounded-lg p-3 mb-4 max-w-lg">
                      <form className="space-y-2" onSubmit={handleUploadEpisode}>
                        <div className="grid grid-cols-3 gap-2">
                          <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Season *</label><input className={inputCls} placeholder="1" value={eSeason} onChange={e => setESeason(e.target.value)} /></div>
                          <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Episode *</label><input className={inputCls} placeholder="1" value={eEpisode} onChange={e => setEEpisode(e.target.value)} /></div>
                          <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Ep. Title</label><input className={inputCls} placeholder="Title" value={eEpisodeTitle} onChange={e => setEEpisodeTitle(e.target.value)} /></div>
                        </div>
                        <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Episode Link *</label><input className={inputCls} placeholder="Paste video link..." value={eEpisodeUrl} onChange={e => setEEpisodeUrl(e.target.value)} /></div>
                        <button type="submit" disabled={isUploading} className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-[10px] font-bold hover:bg-primary/90 flex items-center gap-1 disabled:opacity-50">
                          {isUploading ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</> : <><Plus className="w-3 h-3" /> Add</>}
                        </button>
                      </form>
                    </div>
                  )}

                  {managingSeriesEpisodes.length === 0 ? <p className="text-muted-foreground text-xs">No episodes yet.</p> : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-[11px]">
                        <thead><tr className="border-b border-border">
                          <th className="text-left text-muted-foreground font-semibold p-2">S/E</th>
                          <th className="text-left text-muted-foreground font-semibold p-2">Title</th>
                          <th className="text-left text-muted-foreground font-semibold p-2">Actions</th>
                        </tr></thead>
                        <tbody>
                          {managingSeriesEpisodes.map((ep) => (
                            <tr key={ep.id} className="border-b border-border last:border-0">
                              {editingEpisodeId === ep.id ? (
                                <>
                                  <td className="p-2">
                                    <div className="flex gap-1">
                                      <input className="w-10 bg-secondary text-foreground text-[10px] px-1 py-0.5 rounded border border-border" value={editEp.season} onChange={e => setEditEp({ ...editEp, season: e.target.value })} placeholder="S" />
                                      <input className="w-10 bg-secondary text-foreground text-[10px] px-1 py-0.5 rounded border border-border" value={editEp.episode} onChange={e => setEditEp({ ...editEp, episode: e.target.value })} placeholder="E" />
                                    </div>
                                  </td>
                                  <td className="p-2"><input className={inputCls} value={editEp.episodeTitle} onChange={e => setEditEp({ ...editEp, episodeTitle: e.target.value })} /></td>
                                  <td className="p-2 flex gap-1">
                                    <button onClick={() => handleSaveEditEpisode(ep.id)} className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Save</button>
                                    <button onClick={() => setEditingEpisodeId(null)} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded"><X className="w-2.5 h-2.5" /></button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-2 text-muted-foreground">S{ep.season}E{ep.episode}</td>
                                  <td className="p-2 text-foreground font-semibold">{ep.episodeTitle || "—"}</td>
                                  <td className="p-2 flex gap-1">
                                    <button onClick={() => { setEditingEpisodeId(ep.id); setEditEp({ season: ep.season, episode: ep.episode, episodeTitle: ep.episodeTitle, episodeUrl: ep.episodeUrl }); }} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Edit2 className="w-2.5 h-2.5" /> Edit</button>
                                    <button onClick={() => handleDeleteEpisode(ep.id)} className="text-[9px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Trash2 className="w-2.5 h-2.5" /> Delete</button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ====== WALLET ====== */}
          {activeTab === "wallet" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-3">Wallet</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="bg-card border border-border rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1"><DollarSign className="w-3.5 h-3.5 text-primary" /></div>
                  <p className="text-foreground text-sm font-bold">{formatUGX(balance)}</p>
                  <p className="text-[9px] text-muted-foreground">Available Balance</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1"><Receipt className="w-3.5 h-3.5 text-badge-hd" /></div>
                  <p className="text-foreground text-sm font-bold">{formatUGX(totalEarned)}</p>
                  <p className="text-[9px] text-muted-foreground">Total Earned</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1"><ArrowDownToLine className="w-3.5 h-3.5 text-badge-new" /></div>
                  <p className="text-foreground text-sm font-bold">{formatUGX(totalWithdrawn)}</p>
                  <p className="text-[9px] text-muted-foreground">Withdrawn</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1"><Download className="w-3.5 h-3.5 text-accent" /></div>
                  <p className="text-foreground text-sm font-bold">{totalDownloads}</p>
                  <p className="text-[9px] text-muted-foreground">Confirmed Downloads</p>
                </div>
              </div>

              <h3 className="text-foreground text-[11px] font-bold mb-2">Withdraw Funds</h3>
              {!isWithdrawWindow && (
                <div className="bg-secondary border border-border rounded-lg p-2.5 mb-3">
                  <p className="text-muted-foreground text-[10px]">⏰ Withdrawals available every <span className="text-foreground font-bold">Saturday 12:00 PM – Midnight</span> only.</p>
                </div>
              )}
              <div className="bg-card border border-border rounded-lg p-3 max-w-sm mb-4">
                <form className="space-y-2" onSubmit={handleWithdraw}>
                  <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Amount (UGX)</label><input value={wAmount} onChange={e => setWAmount(e.target.value)} className={inputCls} placeholder="Enter amount" type="number" disabled={!isWithdrawWindow} /></div>
                  <div><label className="text-foreground text-[10px] font-semibold mb-0.5 block">Mobile Money Number</label><input value={wPhone} onChange={e => setWPhone(e.target.value)} className={inputCls} placeholder="0770 000 000" disabled={!isWithdrawWindow} /></div>
                  <button type="submit" disabled={!isWithdrawWindow || balance <= 0 || withdrawing} className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-[10px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1">
                    {withdrawing ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</> : "Withdraw"}
                  </button>
                </form>
              </div>

              <h3 className="text-foreground text-[11px] font-bold mb-2">Recent Transactions</h3>
              <div className="bg-card border border-border rounded-lg p-3">
                {transactions.length === 0 ? <p className="text-muted-foreground text-[10px]">No transactions yet.</p> : (
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-[10px]">
                      <thead><tr className="border-b border-border">
                        <th className="text-left p-1.5 text-muted-foreground font-semibold">Type</th>
                        <th className="text-left p-1.5 text-muted-foreground font-semibold">Amount</th>
                        <th className="text-left p-1.5 text-muted-foreground font-semibold">Details</th>
                        <th className="text-left p-1.5 text-muted-foreground font-semibold">Date</th>
                      </tr></thead>
                      <tbody>
                        {transactions.slice(0, 20).map((tx) => (
                          <tr key={tx.id} className="border-b border-border last:border-0">
                            <td className="p-1.5"><span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", tx.type === "download_credit" ? "bg-green-500/20 text-green-400" : tx.type === "withdrawal" ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/20 text-primary")}>{tx.type === "download_credit" ? "Download" : tx.type === "withdrawal" ? "Withdraw" : "Bonus"}</span></td>
                            <td className="p-1.5 text-foreground font-bold">{tx.type === "withdrawal" ? `-${formatUGX(tx.amount)}` : `+${formatUGX(tx.amount)}`}</td>
                            <td className="p-1.5 text-muted-foreground truncate max-w-[150px]">{tx.contentTitle || tx.phone || "—"}</td>
                            <td className="p-1.5 text-muted-foreground">{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-3 mt-4">
                <h4 className="text-foreground text-[11px] font-bold mb-2">Earning Rules</h4>
                <ul className="text-[10px] text-muted-foreground space-y-1">
                  <li>• Each confirmed download by a paying subscriber = <span className="text-primary font-bold">UGX 250</span></li>
                  <li>• Downloads by VJs, musicians, admins, or admin-activated users do NOT count</li>
                  <li>• Withdrawals available every Saturday 12 PM – Midnight</li>
                  <li>• You cannot withdraw more than your available balance</li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VJDashboard;
