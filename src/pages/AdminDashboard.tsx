import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import {
  collection, getDocs, doc, updateDoc, deleteDoc, setDoc, Timestamp, getDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import {
  FireMovie, FireMusic, FireTikTok, FireChannel, FireProfile, FireEpisode,
  deleteMovie, deleteMusicVideo, deleteTikTokVideo, updateMovie, updateMusicVideo,
  addMovie, addMusicVideo, addTikTokVideo, addChannel, addEpisode, deleteEpisode, updateEpisode,
  saveProfileToFirestore,
} from "@/lib/firestore";
import { addCarousel, getCarousels, deleteCarousel, FireCarousel } from "@/lib/carousels";
import { activateSubscription } from "@/contexts/SubscriptionContext";
import { useMovies, useMusicVideos, useTikTokVideos, useChannels, useActivities } from "@/hooks/useFirestore";
import { getWalletBalance, getTransactionHistory, sendWithdrawal, formatPhone } from "@/lib/payments";
import { toast } from "sonner";
import {
  Users, Film, Music, Video, Tv, BarChart3, Trash2, Edit, Eye,
  Plus, Search, Shield, Crown, DollarSign, RefreshCw, X, Check,
  Download, UserPlus, Upload, Wallet, List, Loader2, ArrowDownToLine, Image, TrendingUp
} from "lucide-react";
import { getAllCreatorEarnings, getAllEarningTransactions, resetAllContentCounts, adminCreditEarning, adminAddVJDownloads, CreatorEarning, EarningTransaction } from "@/lib/earnings";
import { cn } from "@/lib/utils";
import { genreList } from "@/data/categories";

const ADMIN_EMAIL = "mainplatform.nexus@gmail.com";

type Tab = "overview" | "add-creator" | "users" | "upload" | "manage" | "subscriptions" | "wallet" | "carousel" | "earnings";

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-xs">Loading...</div>;
  if (!user || user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "add-creator", label: "Add VJ/Artist", icon: UserPlus },
    { id: "upload", label: "Upload Content", icon: Upload },
    { id: "manage", label: "Manage Content", icon: List },
    { id: "users", label: "Users & Subs", icon: Users },
    { id: "subscriptions", label: "Subscriptions", icon: Crown },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "carousel", label: "Carousel", icon: Image },
    { id: "earnings", label: "Creator Earnings", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-foreground text-sm font-bold">Admin Panel</h1>
        </div>
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-semibold whitespace-nowrap transition-colors", activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted")}>
              <tab.icon className="w-3 h-3" />{tab.label}
            </button>
          ))}
        </div>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "add-creator" && <AddCreatorTab />}
        {activeTab === "upload" && <UploadTab />}
        {activeTab === "manage" && <ManageTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "subscriptions" && <SubscriptionsTab />}
        {activeTab === "wallet" && <WalletTab />}
        {activeTab === "carousel" && <CarouselTab />}
        {activeTab === "earnings" && <CreatorEarningsTab />}
      </div>
    </div>
  );
};

// ========== OVERVIEW ==========
const OverviewTab = () => {
  const { movies } = useMovies();
  const { music } = useMusicVideos();
  const { videos: tiktok } = useTikTokVideos();
  const { activities } = useActivities();
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    getDocs(collection(db, "profiles")).then(snap => setUserCount(snap.size));
  }, []);

  const totalViews = movies.reduce((a, m) => a + (m.views || 0), 0) + tiktok.reduce((a, t) => a + (t.views || 0), 0);
  const totalDownloads = movies.reduce((a, m) => a + (m.downloads || 0), 0);

  const stats = [
    { label: "Total Users", value: userCount, icon: Users, color: "text-blue-400" },
    { label: "Movies", value: movies.length, icon: Film, color: "text-green-400" },
    { label: "Music Videos", value: music.length, icon: Music, color: "text-purple-400" },
    { label: "TikTok Videos", value: tiktok.length, icon: Video, color: "text-pink-400" },
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-yellow-400" },
    { label: "Total Downloads", value: totalDownloads.toLocaleString(), icon: Download, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon className={cn("w-3.5 h-3.5", s.color)} />
              <span className="text-[9px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-foreground text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded p-3">
        <h3 className="text-foreground text-xs font-bold mb-2">Recent Activity</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {activities.slice(0, 20).map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-[10px] py-1 border-b border-border last:border-0">
              <span className="text-muted-foreground">{a.userName}</span>
              <span className="text-primary font-semibold">{a.type}</span>
              <span className="text-foreground truncate flex-1">{a.contentTitle}</span>
            </div>
          ))}
          {activities.length === 0 && <p className="text-muted-foreground text-[10px]">No recent activity</p>}
        </div>
      </div>
    </div>
  );
};

// ========== ADD CREATOR ==========
const AddCreatorTab = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"vj" | "musician" | "tiktoker">("vj");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [skipPayment, setSkipPayment] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName) { toast.error("Email, password and first name required"); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
      await saveProfileToFirestore(cred.user.uid, { firstName, lastName, role, phone, email });
      
      // Skip creator payment gate if checked
      if (skipPayment && (role === "vj" || role === "musician")) {
        await setDoc(doc(db, "creator_payments", `${cred.user.uid}_${role}`), {
          userId: cred.user.uid, role, amount: 0, transactionRef: "admin_bypass",
          paid: true, paidAt: Timestamp.now(),
        });
      }
      
      toast.success(`${role.toUpperCase()} account created for ${email}`);
      setEmail(""); setPassword(""); setFirstName(""); setLastName(""); setPhone("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    }
    setLoading(false);
  };

  const inputCls = "w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="max-w-lg">
      <h2 className="text-foreground text-sm font-bold mb-4">Add VJ / Artist / TikToker</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <form className="space-y-3" onSubmit={handleCreate}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">First Name *</label><input className={inputCls} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Last Name</label><input className={inputCls} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" /></div>
          </div>
          <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Email *</label><input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" /></div>
          <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Password *</label><input className={inputCls} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" /></div>
          <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Phone</label><input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="0770 000 000" /></div>
          <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Role *</label>
            <select className={inputCls} value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="vj">VJ</option>
              <option value="musician">Musician / Artist</option>
              <option value="tiktoker">TikToker</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-foreground cursor-pointer">
            <input type="checkbox" checked={skipPayment} onChange={e => setSkipPayment(e.target.checked)} className="accent-primary" />
            Skip creator payment gate (free access)
          </label>
          <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</> : <><UserPlus className="w-3.5 h-3.5" /> Create Account</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ========== UPLOAD TAB ==========
const UploadTab = () => {
  const [uploadType, setUploadType] = useState<"movie" | "series" | "episode" | "music" | "tiktok" | "channel">("movie");
  const { user } = useAuth();
  const { movies } = useMovies();
  const seriesList = movies.filter(m => m.type === "series");
  const [loading, setLoading] = useState(false);

  // Movie
  const [mTitle, setMTitle] = useState(""); const [mYear, setMYear] = useState(""); const [mGenre, setMGenre] = useState("");
  const [mDesc, setMDesc] = useState(""); const [mPoster, setMPoster] = useState(""); const [mUrl, setMUrl] = useState("");
  const [mVjName, setMVjName] = useState("");

  // Episode
  const [eSeriesId, setESeriesId] = useState(""); const [eSeason, setESeason] = useState(""); const [eEp, setEEp] = useState("");
  const [eTitle, setETitle] = useState(""); const [eUrl, setEUrl] = useState("");

  // Music - with R2 file upload
  const [muTitle, setMuTitle] = useState(""); const [muArtist, setMuArtist] = useState(""); const [muGenre, setMuGenre] = useState("Afrobeat");
  const [muYear, setMuYear] = useState(""); const [muDur, setMuDur] = useState("");
  const [muVideoFile, setMuVideoFile] = useState<File | null>(null);
  const [muThumbFile, setMuThumbFile] = useState<File | null>(null);
  const [muUploadProgress, setMuUploadProgress] = useState(0);
  const [muThumbProgress, setMuThumbProgress] = useState(0);

  // TikTok
  const [ttTitle, setTtTitle] = useState(""); const [ttDesc, setTtDesc] = useState(""); const [ttUrl, setTtUrl] = useState("");
  const [ttThumb, setTtThumb] = useState(""); const [ttMusic, setTtMusic] = useState(""); const [ttCreator, setTtCreator] = useState(""); const [ttAvatar, setTtAvatar] = useState("");

  // Channel
  const [chName, setChName] = useState(""); const [chLogo, setChLogo] = useState(""); const [chStream, setChStream] = useState(""); const [chDesc, setChDesc] = useState("");

  const inputCls = "w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (uploadType === "movie" || uploadType === "series") {
        if (!mTitle) throw new Error("Title required");
        await addMovie({
          title: mTitle, year: mYear, quality: "1080p", genre: mGenre, description: mDesc,
          posterUrl: mPoster, movieUrl: mUrl, downloadUrl: "", featured: false,
          type: uploadType, vjId: user?.id || "admin", vjName: mVjName || "Admin",
        });
        toast.success(`${uploadType === "series" ? "Series" : "Movie"} uploaded!`);
        setMTitle(""); setMYear(""); setMGenre(""); setMDesc(""); setMPoster(""); setMUrl(""); setMVjName("");
      } else if (uploadType === "episode") {
        if (!eSeriesId) throw new Error("Please select a series");
        if (!eUrl) throw new Error("Episode URL required");
        const series = seriesList.find(s => s.id === eSeriesId);
        await addEpisode({
          movieId: eSeriesId,
          seriesTitle: series?.title || "",
          season: eSeason.trim() || "1",
          episode: eEp.trim() || "1",
          episodeTitle: eTitle.trim() || `Episode ${eEp.trim() || "1"}`,
          episodeUrl: eUrl,
          vjId: user?.id || "admin",
        });
        toast.success("Episode uploaded!");
        setESeriesId(""); setESeason(""); setEEp(""); setETitle(""); setEUrl("");
      } else if (uploadType === "music") {
        if (!muTitle) throw new Error("Title required");
        if (!muVideoFile) throw new Error("Please select a music video file");
        
        // Upload video to R2
        const { uploadToR2 } = await import("@/lib/r2Upload");
        toast.info("Uploading music video...");
        setMuUploadProgress(0);
        const videoUrl = await uploadToR2(muVideoFile, (p) => setMuUploadProgress(p.percent));
        
        // Upload thumbnail if provided
        let thumbnailUrl = "";
        if (muThumbFile) {
          toast.info("Uploading thumbnail...");
          setMuThumbProgress(0);
          thumbnailUrl = await uploadToR2(muThumbFile, (p) => setMuThumbProgress(p.percent));
        }
        
        await addMusicVideo({ title: muTitle, artist: muArtist, genre: muGenre, year: muYear, duration: muDur, thumbnailUrl, videoUrl, musicianId: "admin", musicianName: muArtist || "Admin", verified: true });
        toast.success("Music video uploaded!");
        setMuTitle(""); setMuArtist(""); setMuYear(""); setMuDur(""); setMuVideoFile(null); setMuThumbFile(null); setMuUploadProgress(0); setMuThumbProgress(0);
      } else if (uploadType === "tiktok") {
        if (!ttUrl) throw new Error("Video URL required");
        await addTikTokVideo({ title: ttTitle, description: ttDesc, videoUrl: ttUrl, thumbnailUrl: ttThumb, music: ttMusic, tiktokerId: "admin", tiktokerName: ttCreator || "Admin", tiktokerAvatar: ttAvatar, verified: true });
        toast.success("TikTok video uploaded!");
        setTtTitle(""); setTtDesc(""); setTtUrl(""); setTtThumb(""); setTtMusic(""); setTtCreator(""); setTtAvatar("");
      } else if (uploadType === "channel") {
        if (!chName || !chStream) throw new Error("Name and stream URL required");
        await addChannel({ name: chName, logoUrl: chLogo, streamUrl: chStream, isLive: true, description: chDesc, vjId: user?.id || "admin" });
        toast.success("Channel added!");
        setChName(""); setChLogo(""); setChStream(""); setChDesc("");
      }
    } catch (err: any) { toast.error(err.message || "Upload failed"); }
    setLoading(false);
  };

  const types = [
    { id: "movie", label: "Movie" }, { id: "series", label: "Series" }, { id: "episode", label: "Episode" },
    { id: "music", label: "Music" }, { id: "tiktok", label: "TikTok" }, { id: "channel", label: "TV Channel" },
  ];

  return (
    <div className="max-w-lg">
      <h2 className="text-foreground text-sm font-bold mb-3">Upload Content</h2>
      <div className="flex gap-1 mb-4 flex-wrap">
        {types.map(t => (
          <button key={t.id} onClick={() => setUploadType(t.id as any)} className={cn("px-2.5 py-1 rounded text-[10px] font-bold", uploadType === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <form className="space-y-3" onSubmit={handleSubmit}>
          {(uploadType === "movie" || uploadType === "series") && <>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Title *</label><input className={inputCls} value={mTitle} onChange={e => setMTitle(e.target.value)} placeholder="Title" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Year</label><input className={inputCls} value={mYear} onChange={e => setMYear(e.target.value)} placeholder="2026" /></div>
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Genre</label><select className={inputCls} value={mGenre} onChange={e => setMGenre(e.target.value)}><option value="">Select</option>{genreList.map(g => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">VJ Name</label><input className={inputCls} value={mVjName} onChange={e => setMVjName(e.target.value)} placeholder="VJ name" /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Description</label><textarea className={`${inputCls} h-16 resize-none`} value={mDesc} onChange={e => setMDesc(e.target.value)} /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Poster URL</label><input className={inputCls} value={mPoster} onChange={e => setMPoster(e.target.value)} placeholder="https://..." /></div>
            {uploadType === "movie" && <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Movie Link *</label><input className={inputCls} value={mUrl} onChange={e => setMUrl(e.target.value)} placeholder="https://..." /></div>}
          </>}
          {uploadType === "episode" && <>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Series *</label>
              <select className={inputCls} value={eSeriesId} onChange={e => setESeriesId(e.target.value)}>
                <option value="">Select series</option>
                {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              {seriesList.length === 0 && <p className="text-muted-foreground text-[9px] mt-1">No series found. Create a series first.</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Season</label><input className={inputCls} value={eSeason} onChange={e => setESeason(e.target.value)} placeholder="1" /></div>
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Episode</label><input className={inputCls} value={eEp} onChange={e => setEEp(e.target.value)} placeholder="1" /></div>
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Title</label><input className={inputCls} value={eTitle} onChange={e => setETitle(e.target.value)} /></div>
            </div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Episode Link *</label><input className={inputCls} value={eUrl} onChange={e => setEUrl(e.target.value)} placeholder="https://..." /></div>
          </>}
          {uploadType === "music" && <>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Song Title *</label><input className={inputCls} value={muTitle} onChange={e => setMuTitle(e.target.value)} /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Artist</label><input className={inputCls} value={muArtist} onChange={e => setMuArtist(e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Genre</label><select className={inputCls} value={muGenre} onChange={e => setMuGenre(e.target.value)}><option>Afrobeat</option><option>Hip Hop</option><option>Gospel</option><option>Dancehall</option><option>RnB</option><option>Traditional</option></select></div>
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Year</label><input className={inputCls} value={muYear} onChange={e => setMuYear(e.target.value)} /></div>
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Duration</label><input className={inputCls} value={muDur} onChange={e => setMuDur(e.target.value)} placeholder="3:45" /></div>
            </div>
            <div>
              <label className="text-foreground text-[11px] font-semibold mb-1 block">Music Video File * (max 200MB)</label>
              <input type="file" accept="video/*" onChange={e => setMuVideoFile(e.target.files?.[0] || null)}
                className="w-full bg-secondary text-foreground text-[10px] px-3 py-2 rounded border border-border file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-primary file:text-primary-foreground file:cursor-pointer" />
              {muVideoFile && <p className="text-muted-foreground text-[9px] mt-1">Selected: {muVideoFile.name} ({(muVideoFile.size / (1024*1024)).toFixed(1)} MB)</p>}
              {loading && muUploadProgress > 0 && muUploadProgress < 100 && (
                <div className="mt-1.5">
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${muUploadProgress}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Uploading video... {muUploadProgress}%</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-foreground text-[11px] font-semibold mb-1 block">Thumbnail Image (optional)</label>
              <input type="file" accept="image/*" onChange={e => setMuThumbFile(e.target.files?.[0] || null)}
                className="w-full bg-secondary text-foreground text-[10px] px-3 py-2 rounded border border-border file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-primary file:text-primary-foreground file:cursor-pointer" />
              {muThumbFile && <p className="text-muted-foreground text-[9px] mt-1">Selected: {muThumbFile.name}</p>}
              {loading && muThumbProgress > 0 && muThumbProgress < 100 && (
                <div className="mt-1.5">
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${muThumbProgress}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Uploading thumbnail... {muThumbProgress}%</p>
                </div>
              )}
            </div>
          </>}
          {uploadType === "tiktok" && <>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Title</label><input className={inputCls} value={ttTitle} onChange={e => setTtTitle(e.target.value)} /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Description</label><textarea className={`${inputCls} h-16 resize-none`} value={ttDesc} onChange={e => setTtDesc(e.target.value)} /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Video URL *</label><input className={inputCls} value={ttUrl} onChange={e => setTtUrl(e.target.value)} /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Thumbnail URL</label><input className={inputCls} value={ttThumb} onChange={e => setTtThumb(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Creator Name</label><input className={inputCls} value={ttCreator} onChange={e => setTtCreator(e.target.value)} /></div>
              <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Music</label><input className={inputCls} value={ttMusic} onChange={e => setTtMusic(e.target.value)} /></div>
            </div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Avatar URL</label><input className={inputCls} value={ttAvatar} onChange={e => setTtAvatar(e.target.value)} /></div>
          </>}
          {uploadType === "channel" && <>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Channel Name *</label><input className={inputCls} value={chName} onChange={e => setChName(e.target.value)} /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Logo URL</label><input className={inputCls} value={chLogo} onChange={e => setChLogo(e.target.value)} /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Stream URL *</label><input className={inputCls} value={chStream} onChange={e => setChStream(e.target.value)} /></div>
            <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Description</label><input className={inputCls} value={chDesc} onChange={e => setChDesc(e.target.value)} /></div>
          </>}
          <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {uploadType === "music" ? `Uploading... ${muUploadProgress}%` : "Uploading..."}</> : <><Plus className="w-3.5 h-3.5" /> Upload</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ========== MANAGE CONTENT ==========
const ManageTab = () => {
  const [sub, setSub] = useState<"movies" | "music" | "tiktok" | "channels" | "episodes">("movies");
  const { movies } = useMovies();
  const { music } = useMusicVideos();
  const { videos: tiktok } = useTikTokVideos();
  const { channels } = useChannels();
  const [search, setSearch] = useState("");

  // Edit states
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Episode management
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<FireEpisode[]>([]);

  const loadEpisodes = async (movieId: string) => {
    setSelectedSeries(movieId);
    const { getEpisodes } = await import("@/lib/firestore");
    const eps = await getEpisodes(movieId);
    setEpisodes(eps);
  };

  const handleDeleteMovie = async (id: string) => { if (!confirm("Delete?")) return; try { await deleteMovie(id); toast.success("Deleted"); } catch { toast.error("Failed"); } };
  const handleDeleteMusic = async (id: string) => { if (!confirm("Delete?")) return; try { await deleteMusicVideo(id); toast.success("Deleted"); } catch { toast.error("Failed"); } };
  const handleDeleteTiktok = async (id: string) => { if (!confirm("Delete?")) return; try { await deleteTikTokVideo(id); toast.success("Deleted"); } catch { toast.error("Failed"); } };
  const handleDeleteEpisode = async (id: string) => { if (!confirm("Delete?")) return; try { await deleteEpisode(id); if (selectedSeries) loadEpisodes(selectedSeries); toast.success("Deleted"); } catch { toast.error("Failed"); } };

  const handleSaveMovie = async (id: string) => { try { await updateMovie(id, editData); setEditId(null); toast.success("Updated"); } catch { toast.error("Failed"); } };
  const handleSaveMusic = async (id: string) => { try { await updateMusicVideo(id, editData); setEditId(null); toast.success("Updated"); } catch { toast.error("Failed"); } };
  const handleSaveEpisode = async (id: string) => { try { await updateEpisode(id, editData); setEditId(null); if (selectedSeries) loadEpisodes(selectedSeries); toast.success("Updated"); } catch { toast.error("Failed"); } };

  const toggleFeatured = async (movie: FireMovie) => { try { await updateMovie(movie.id, { featured: !movie.featured }); toast.success(movie.featured ? "Unfeatured" : "Featured"); } catch { toast.error("Failed"); } };

  const inputCls = "bg-secondary text-foreground text-[10px] px-2 py-1 rounded border border-border";
  const seriesList = movies.filter(m => m.type === "series");

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {(["movies", "music", "tiktok", "channels", "episodes"] as const).map(t => (
          <button key={t} onClick={() => { setSub(t); setSelectedSeries(null); setEditId(null); }} className={cn("px-2.5 py-1 rounded text-[10px] font-bold capitalize", sub === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
            {t}
          </button>
        ))}
      </div>
      <div className="relative max-w-xs">
        <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-secondary text-foreground text-[10px] pl-7 pr-3 py-1.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      {sub === "movies" && (
        <div className="grid gap-2">
          {movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).map(m => (
            <div key={m.id} className="bg-card border border-border rounded p-2 flex items-center gap-3">
              <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-secondary">
                {m.posterUrl && <img src={m.posterUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              {editId === m.id ? (
                <div className="flex-1 space-y-1">
                  <input className={inputCls + " w-full"} value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Title" />
                  <div className="flex gap-1">
                    <input className={inputCls + " w-20"} value={editData.year || ""} onChange={e => setEditData({ ...editData, year: e.target.value })} placeholder="Year" />
                    <input className={inputCls + " flex-1"} value={editData.genre || ""} onChange={e => setEditData({ ...editData, genre: e.target.value })} placeholder="Genre" />
                  </div>
                  <input className={inputCls + " w-full"} value={editData.posterUrl || ""} onChange={e => setEditData({ ...editData, posterUrl: e.target.value })} placeholder="Poster URL" />
                  <input className={inputCls + " w-full"} value={editData.movieUrl || ""} onChange={e => setEditData({ ...editData, movieUrl: e.target.value })} placeholder="Movie URL" />
                  <div className="flex gap-1">
                    <button onClick={() => handleSaveMovie(m.id)} className="text-[9px] bg-primary text-primary-foreground px-2 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Save</button>
                    <button onClick={() => setEditId(null)} className="text-[9px] bg-secondary text-foreground px-2 py-0.5 rounded"><X className="w-2.5 h-2.5" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground text-[11px] font-bold truncate">{m.title}</h4>
                    <p className="text-muted-foreground text-[9px]">{m.vjName} • {m.year} • {m.genre} • {m.type}</p>
                    <div className="flex gap-2 mt-0.5 text-[9px] text-muted-foreground">
                      <span><Eye className="w-2.5 h-2.5 inline" /> {m.views}</span>
                      <span><Download className="w-2.5 h-2.5 inline" /> {m.downloads}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleFeatured(m)} className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold", m.featured ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                      {m.featured ? "★" : "☆"}
                    </button>
                    <button onClick={() => { setEditId(m.id); setEditData({ title: m.title, year: m.year, genre: m.genre, posterUrl: m.posterUrl, movieUrl: m.movieUrl, description: m.description }); }} className="text-foreground hover:text-primary p-1"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteMovie(m.id)} className="text-destructive p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {sub === "music" && (
        <div className="grid gap-2">
          {music.filter(m => `${m.title} ${m.artist}`.toLowerCase().includes(search.toLowerCase())).map(m => (
            <div key={m.id} className="bg-card border border-border rounded p-2 flex items-center gap-3">
              <div className="w-12 h-8 rounded overflow-hidden flex-shrink-0 bg-secondary">
                {m.thumbnailUrl && <img src={m.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              {editId === m.id ? (
                <div className="flex-1 space-y-1">
                  <input className={inputCls + " w-full"} value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Title" />
                  <input className={inputCls + " w-full"} value={editData.artist || ""} onChange={e => setEditData({ ...editData, artist: e.target.value })} placeholder="Artist" />
                  <input className={inputCls + " w-full"} value={editData.videoUrl || ""} onChange={e => setEditData({ ...editData, videoUrl: e.target.value })} placeholder="Video URL" />
                  <div className="flex gap-1">
                    <button onClick={() => handleSaveMusic(m.id)} className="text-[9px] bg-primary text-primary-foreground px-2 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Save</button>
                    <button onClick={() => setEditId(null)} className="text-[9px] bg-secondary text-foreground px-2 py-0.5 rounded"><X className="w-2.5 h-2.5" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground text-[11px] font-bold truncate">{m.title}</h4>
                    <p className="text-muted-foreground text-[9px]">{m.artist} • {m.musicianName} • {m.genre}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditId(m.id); setEditData({ title: m.title, artist: m.artist, genre: m.genre, videoUrl: m.videoUrl, thumbnailUrl: m.thumbnailUrl }); }} className="text-foreground hover:text-primary p-1"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteMusic(m.id)} className="text-destructive p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {sub === "tiktok" && (
        <div className="grid gap-2">
          {tiktok.filter(v => `${v.title} ${v.tiktokerName}`.toLowerCase().includes(search.toLowerCase())).map(v => (
            <div key={v.id} className="bg-card border border-border rounded p-2 flex items-center gap-3">
              <div className="w-8 h-12 rounded overflow-hidden flex-shrink-0 bg-secondary">
                {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-foreground text-[11px] font-bold truncate">{v.title || v.description}</h4>
                <p className="text-muted-foreground text-[9px]">{v.tiktokerName} • ❤ {v.likes} • 👁 {v.views}</p>
              </div>
              <button onClick={() => handleDeleteTiktok(v.id)} className="text-destructive p-1"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}

      {sub === "channels" && (
        <div className="grid gap-2">
          {channels.map(ch => (
            <div key={ch.id} className="bg-card border border-border rounded p-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-secondary">
                {ch.logoUrl && <img src={ch.logoUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-foreground text-[11px] font-bold">{ch.name}</h4>
                <p className="text-muted-foreground text-[9px]">{ch.description}</p>
              </div>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", ch.isLive ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground")}>
                {ch.isLive ? "LIVE" : "Offline"}
              </span>
            </div>
          ))}
        </div>
      )}

      {sub === "episodes" && (
        <div>
          {!selectedSeries ? (
            <div className="grid gap-2">
              <p className="text-muted-foreground text-[10px]">Select a series to manage episodes:</p>
              {seriesList.map(s => (
                <button key={s.id} onClick={() => loadEpisodes(s.id)} className="bg-card border border-border rounded p-2 text-left hover:border-primary/50">
                  <h4 className="text-foreground text-[11px] font-bold">{s.title}</h4>
                  <p className="text-muted-foreground text-[9px]">{s.year} • {s.genre}</p>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedSeries(null)} className="text-primary text-[11px] font-bold mb-3 flex items-center gap-1">← Back to Series</button>
              <h3 className="text-foreground text-xs font-bold mb-2">Episodes — {seriesList.find(s => s.id === selectedSeries)?.title}</h3>
              {episodes.length === 0 ? <p className="text-muted-foreground text-[10px]">No episodes</p> : (
                <div className="grid gap-2">
                  {episodes.map(ep => (
                    <div key={ep.id} className="bg-card border border-border rounded p-2 flex items-center gap-3">
                      {editId === ep.id ? (
                        <div className="flex-1 space-y-1">
                          <div className="flex gap-1">
                            <input className={inputCls + " w-16"} value={editData.season || ""} onChange={e => setEditData({ ...editData, season: e.target.value })} placeholder="S" />
                            <input className={inputCls + " w-16"} value={editData.episode || ""} onChange={e => setEditData({ ...editData, episode: e.target.value })} placeholder="E" />
                            <input className={inputCls + " flex-1"} value={editData.episodeTitle || ""} onChange={e => setEditData({ ...editData, episodeTitle: e.target.value })} />
                          </div>
                          <input className={inputCls + " w-full"} value={editData.episodeUrl || ""} onChange={e => setEditData({ ...editData, episodeUrl: e.target.value })} placeholder="URL" />
                          <div className="flex gap-1">
                            <button onClick={() => handleSaveEpisode(ep.id)} className="text-[9px] bg-primary text-primary-foreground px-2 py-0.5 rounded"><Check className="w-2.5 h-2.5 inline" /> Save</button>
                            <button onClick={() => setEditId(null)} className="text-[9px] bg-secondary text-foreground px-2 py-0.5 rounded"><X className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <span className="text-muted-foreground text-[10px]">S{ep.season}E{ep.episode}</span>
                            <h4 className="text-foreground text-[11px] font-bold">{ep.episodeTitle || "—"}</h4>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditId(ep.id); setEditData({ season: ep.season, episode: ep.episode, episodeTitle: ep.episodeTitle, episodeUrl: ep.episodeUrl }); }} className="text-foreground hover:text-primary p-1"><Edit className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteEpisode(ep.id)} className="text-destructive p-1"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ========== USERS & SUBSCRIPTIONS ==========
const UsersTab = () => {
  const [profiles, setProfiles] = useState<FireProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activatingUser, setActivatingUser] = useState<string | null>(null);
  const [subType, setSubType] = useState<"content" | "games">("content");
  const [subPlan, setSubPlan] = useState("1day");
  const [subDays, setSubDays] = useState(1);

  useEffect(() => {
    getDocs(collection(db, "profiles")).then(snap => {
      setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() } as FireProfile)));
      setLoading(false);
    });
  }, []);

  const updateRole = async (uid: string, role: string) => {
    try { await updateDoc(doc(db, "profiles", uid), { role }); setProfiles(prev => prev.map(p => p.id === uid ? { ...p, role } : p)); toast.success("Role updated"); }
    catch { toast.error("Failed"); }
  };

  const deleteUser = async (uid: string) => {
    if (!confirm("Delete user?")) return;
    try { await deleteDoc(doc(db, "profiles", uid)); setProfiles(prev => prev.filter(p => p.id !== uid)); toast.success("Deleted"); }
    catch { toast.error("Failed"); }
  };

  const activateSub = async (uid: string) => {
    try {
      await activateSubscription(uid, subType, subPlan, subDays, `admin_manual_${Date.now()}`);
      toast.success(`${subType} subscription activated for ${subDays} days`);
      setActivatingUser(null);
    } catch { toast.error("Failed to activate"); }
  };

  const planOptions = [
    { id: "1day", days: 1, label: "1 Day" }, { id: "1week", days: 7, label: "1 Week" },
    { id: "1month", days: 30, label: "1 Month" }, { id: "3months", days: 90, label: "3 Months" },
  ];

  const filtered = profiles.filter(p => `${p.firstName} ${p.lastName} ${p.email} ${p.role}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-secondary text-foreground text-[10px] pl-7 pr-3 py-1.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <span className="text-muted-foreground text-[10px]">{filtered.length} users</span>
      </div>
      {loading ? <p className="text-muted-foreground text-[10px]">Loading...</p> : (
        <div className="bg-card border border-border rounded overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground font-semibold">Name</th>
                <th className="text-left p-2 text-muted-foreground font-semibold">Email</th>
                <th className="text-left p-2 text-muted-foreground font-semibold">Role</th>
                <th className="text-left p-2 text-muted-foreground font-semibold">Phone</th>
                <th className="text-right p-2 text-muted-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-2 text-foreground font-semibold">{p.firstName} {p.lastName}</td>
                  <td className="p-2 text-muted-foreground">{p.email}</td>
                  <td className="p-2">
                    <select value={p.role} onChange={e => updateRole(p.id, e.target.value)} className="bg-secondary text-foreground text-[10px] px-1.5 py-0.5 rounded border border-border">
                      <option value="viewer">Viewer</option><option value="vj">VJ</option><option value="musician">Musician</option><option value="tiktoker">TikToker</option><option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-2 text-muted-foreground">{p.phone || "-"}</td>
                  <td className="p-2 text-right flex gap-1 justify-end">
                    <button onClick={() => setActivatingUser(activatingUser === p.id ? null : p.id)} className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold"><Crown className="w-2.5 h-2.5 inline" /> Sub</button>
                    <button onClick={() => deleteUser(p.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3 h-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activatingUser && (
        <div className="bg-card border border-primary/30 rounded p-3 max-w-sm">
          <h4 className="text-foreground text-[11px] font-bold mb-2">Activate Subscription for {profiles.find(p => p.id === activatingUser)?.email}</h4>
          <div className="space-y-2">
            <select value={subType} onChange={e => setSubType(e.target.value as any)} className="bg-secondary text-foreground text-[10px] px-2 py-1 rounded border border-border w-full">
              <option value="content">Content (Movies/Music/TV)</option><option value="games">Games</option>
            </select>
            <select value={subPlan} onChange={e => { setSubPlan(e.target.value); setSubDays(planOptions.find(p => p.id === e.target.value)?.days || 1); }} className="bg-secondary text-foreground text-[10px] px-2 py-1 rounded border border-border w-full">
              {planOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <button onClick={() => activateSub(activatingUser)} className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-[10px] font-bold w-full">Activate</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ========== SUBSCRIPTIONS OVERVIEW ==========
const SubscriptionsTab = () => {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, "subscriptions")).then(snap => {
      setSubs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const activeSubs = subs.filter(s => {
    const exp = s.expiresAt?.toDate ? s.expiresAt.toDate() : new Date(s.expiresAt);
    return exp > new Date();
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-card border border-border rounded p-3"><p className="text-[9px] text-muted-foreground">Total Subs</p><p className="text-foreground text-lg font-bold">{subs.length}</p></div>
        <div className="bg-card border border-border rounded p-3"><p className="text-[9px] text-muted-foreground">Active</p><p className="text-primary text-lg font-bold">{activeSubs.length}</p></div>
        <div className="bg-card border border-border rounded p-3"><p className="text-[9px] text-muted-foreground">Expired</p><p className="text-destructive text-lg font-bold">{subs.length - activeSubs.length}</p></div>
        <div className="bg-card border border-border rounded p-3"><p className="text-[9px] text-muted-foreground">Revenue</p><p className="text-foreground text-lg font-bold">—</p></div>
      </div>
      {loading ? <p className="text-muted-foreground text-[10px]">Loading...</p> : (
        <div className="bg-card border border-border rounded overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-border">
              <th className="text-left p-2 text-muted-foreground font-semibold">User ID</th>
              <th className="text-left p-2 text-muted-foreground font-semibold">Type</th>
              <th className="text-left p-2 text-muted-foreground font-semibold">Plan</th>
              <th className="text-left p-2 text-muted-foreground font-semibold">Expires</th>
              <th className="text-left p-2 text-muted-foreground font-semibold">Status</th>
            </tr></thead>
            <tbody>
              {subs.map(s => {
                const exp = s.expiresAt?.toDate ? s.expiresAt.toDate() : new Date(s.expiresAt);
                const active = exp > new Date();
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-2 text-foreground font-mono text-[9px]">{s.userId?.slice(0, 12)}...</td>
                    <td className="p-2 text-muted-foreground capitalize">{s.type}</td>
                    <td className="p-2 text-muted-foreground">{s.planId}</td>
                    <td className="p-2 text-muted-foreground">{exp.toLocaleDateString()}</td>
                    <td className="p-2"><span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", active ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive")}>{active ? "Active" : "Expired"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ========== WALLET ==========
const WalletTab = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wPhone, setWPhone] = useState("");
  const [wAmount, setWAmount] = useState("");
  const [wDesc, setWDesc] = useState("Admin withdrawal");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, txRes] = await Promise.all([getWalletBalance(), getTransactionHistory()]);
      if (balRes.success) setBalance(balRes.balance || 0);
      if (Array.isArray(txRes)) setTransactions(txRes);
      else if (txRes.data && Array.isArray(txRes.data)) setTransactions(txRes.data);
      else if (txRes.transactions) setTransactions(txRes.transactions);
    } catch (err) { console.error("Wallet fetch error:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wPhone || !wAmount) { toast.error("Phone and amount required"); return; }
    setWithdrawing(true);
    try {
      const res = await sendWithdrawal(formatPhone(wPhone), Number(wAmount), wDesc);
      if (res.success) { toast.success("Withdrawal initiated!"); fetchData(); setWPhone(""); setWAmount(""); }
      else toast.error(res.message || "Withdrawal failed");
    } catch { toast.error("Withdrawal failed"); }
    setWithdrawing(false);
  };

  const inputCls = "w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] text-muted-foreground mb-1">Wallet Balance</p>
          <p className="text-primary text-xl font-bold">{balance !== null ? `UGX ${balance.toLocaleString()}` : "Loading..."}</p>
          <button onClick={fetchData} className="text-[9px] text-primary font-semibold mt-2 flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> Refresh</button>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 md:col-span-2">
          <h3 className="text-foreground text-xs font-bold mb-2">Withdraw</h3>
          <form className="flex gap-2 items-end flex-wrap" onSubmit={handleWithdraw}>
            <div className="flex-1 min-w-[120px]"><label className="text-[10px] text-muted-foreground block mb-1">Phone</label><input className={inputCls} value={wPhone} onChange={e => setWPhone(e.target.value)} placeholder="0770 000 000" /></div>
            <div className="w-28"><label className="text-[10px] text-muted-foreground block mb-1">Amount</label><input className={inputCls} value={wAmount} onChange={e => setWAmount(e.target.value)} placeholder="5000" type="number" /></div>
            <button type="submit" disabled={withdrawing} className="bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1">
              {withdrawing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDownToLine className="w-3 h-3" />} Withdraw
            </button>
          </form>
        </div>
      </div>

      <div className="bg-card border border-border rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-foreground text-xs font-bold">Transaction History</h3>
          <button onClick={fetchData} className="text-[9px] text-primary font-semibold"><RefreshCw className="w-2.5 h-2.5 inline" /> Refresh</button>
        </div>
        {loading ? <p className="text-muted-foreground text-[10px]">Loading...</p> : transactions.length === 0 ? <p className="text-muted-foreground text-[10px]">No transactions yet</p> : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-[10px]">
              <thead><tr className="border-b border-border">
                <th className="text-left p-1.5 text-muted-foreground font-semibold">Type</th>
                <th className="text-left p-1.5 text-muted-foreground font-semibold">Amount</th>
                <th className="text-left p-1.5 text-muted-foreground font-semibold">Phone</th>
                <th className="text-left p-1.5 text-muted-foreground font-semibold">Status</th>
                <th className="text-left p-1.5 text-muted-foreground font-semibold">Date</th>
              </tr></thead>
              <tbody>
                {transactions.slice(0, 50).map((tx: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-1.5 text-foreground capitalize">{tx.type || tx.transaction_type || "—"}</td>
                    <td className="p-1.5 text-foreground font-bold">UGX {(tx.amount || 0).toLocaleString()}</td>
                    <td className="p-1.5 text-muted-foreground">{tx.msisdn || tx.phone || "—"}</td>
                    <td className="p-1.5"><span className={cn("text-[9px] font-bold px-1 py-0.5 rounded", (tx.status === "success" || tx.request_status === "success") ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400")}>{tx.status || tx.request_status || "—"}</span></td>
                    <td className="p-1.5 text-muted-foreground">{tx.created_at || tx.completed_at ? new Date(tx.created_at || tx.completed_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== CAROUSEL ==========
const CarouselTab = () => {
  const [carousels, setCarousels] = useState<FireCarousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cImage, setCImage] = useState("");
  const [cLink, setCLink] = useState("");
  const [cDesc, setCDesc] = useState("");

  useEffect(() => {
    getCarousels().then(c => { setCarousels(c); setLoading(false); });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cImage) { toast.error("Image URL required"); return; }
    setUploading(true);
    try {
      await addCarousel({ title: cTitle, imageUrl: cImage, linkUrl: cLink, description: cDesc });
      toast.success("Carousel added!");
      setCTitle(""); setCImage(""); setCLink(""); setCDesc("");
      const updated = await getCarousels();
      setCarousels(updated);
    } catch { toast.error("Failed to add carousel"); }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this carousel?")) return;
    try {
      await deleteCarousel(id);
      setCarousels(prev => prev.filter(c => c.id !== id));
      toast.success("Carousel deleted");
    } catch { toast.error("Failed"); }
  };

  const inputCls = "w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-foreground text-sm font-bold">Homepage Carousel</h2>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-foreground text-xs font-bold mb-3">Add Carousel Slide</h3>
        <form className="space-y-3" onSubmit={handleAdd}>
          <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Title</label><input className={inputCls} value={cTitle} onChange={e => setCTitle(e.target.value)} placeholder="Slide title (optional)" /></div>
          <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Image URL *</label><input className={inputCls} value={cImage} onChange={e => setCImage(e.target.value)} placeholder="https://..." /></div>
          <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Link URL</label><input className={inputCls} value={cLink} onChange={e => setCLink(e.target.value)} placeholder="/movie/abc or https://..." /></div>
          <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Description</label><input className={inputCls} value={cDesc} onChange={e => setCDesc(e.target.value)} placeholder="Short description (optional)" /></div>
          <button type="submit" disabled={uploading} className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5">
            {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</> : <><Plus className="w-3.5 h-3.5" /> Add Slide</>}
          </button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-foreground text-xs font-bold mb-3">Current Slides ({carousels.length})</h3>
        {loading ? <p className="text-muted-foreground text-[10px]">Loading...</p> : carousels.length === 0 ? (
          <p className="text-muted-foreground text-[10px]">No carousel slides yet. Add one above.</p>
        ) : (
          <div className="grid gap-2">
            {carousels.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-secondary rounded p-2">
                <img src={c.imageUrl} alt={c.title} className="w-24 h-14 object-cover rounded flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-foreground text-[11px] font-bold truncate">{c.title || "Untitled"}</h4>
                  {c.description && <p className="text-muted-foreground text-[9px] truncate">{c.description}</p>}
                  {c.linkUrl && <p className="text-primary text-[9px] truncate">{c.linkUrl}</p>}
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive/80 p-1 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// ========== CREATOR EARNINGS ==========
const CreatorEarningsTab = () => {
  const [earnings, setEarnings] = useState<CreatorEarning[]>([]);
  const [transactions, setTransactions] = useState<EarningTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  // Manual credit form
  const [creditOpen, setCreditOpen] = useState(false);
  const [creditCreatorId, setCreditCreatorId] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [crediting, setCrediting] = useState(false);

  // Add downloads form (per-VJ inline)
  const [addDlVjId, setAddDlVjId] = useState<string | null>(null);
  const [addDlCount, setAddDlCount] = useState("");
  const [addDlNote, setAddDlNote] = useState("");
  const [addingDl, setAddingDl] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [e, t] = await Promise.all([getAllCreatorEarnings(), getAllEarningTransactions()]);
      setEarnings(e);
      setTransactions(t);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleManualCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(creditAmount, 10);
    if (!creditCreatorId) { toast.error("Select a creator"); return; }
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    const creator = earnings.find(c => c.id === creditCreatorId);
    if (!creator) { toast.error("Creator not found"); return; }
    setCrediting(true);
    try {
      await adminCreditEarning(creator.id, creator.creatorName, creator.creatorRole, amount, creditNote.trim() || "Manual credit by admin");
      toast.success(`UGX ${amount.toLocaleString()} credited to ${creator.creatorName}`);
      setCreditCreatorId(""); setCreditAmount(""); setCreditNote(""); setCreditOpen(false);
      await fetchData();
    } catch { toast.error("Failed to credit earning"); }
    setCrediting(false);
  };

  const handleAddDownloads = async (vj: CreatorEarning) => {
    const count = parseInt(addDlCount, 10);
    if (!count || count <= 0) { toast.error("Enter a valid number of downloads"); return; }
    setAddingDl(true);
    try {
      await adminAddVJDownloads(vj.id, vj.creatorName, count, addDlNote.trim());
      toast.success(`${count} download${count !== 1 ? "s" : ""} added for ${vj.creatorName} (+UGX ${(count * 250).toLocaleString()})`);
      setAddDlVjId(null); setAddDlCount(""); setAddDlNote("");
      await fetchData();
    } catch { toast.error("Failed to add downloads"); }
    setAddingDl(false);
  };

  const handleResetCounts = async () => {
    if (!confirm("This will reset ALL movie/music view and download counters to 0. Are you sure?")) return;
    setResetting(true);
    try {
      await resetAllContentCounts();
      toast.success("All content counts have been reset to 0!");
    } catch { toast.error("Reset failed"); }
    setResetting(false);
  };

  const vjEarnings = earnings.filter(e => e.creatorRole === "vj");
  const musicianEarnings = earnings.filter(e => e.creatorRole === "musician");
  const totalVJBalance = vjEarnings.reduce((s, e) => s + (e.balance || 0), 0);
  const totalVJEarned = vjEarnings.reduce((s, e) => s + (e.totalEarned || 0), 0);
  const totalMusicianBalance = musicianEarnings.reduce((s, e) => s + (e.balance || 0), 0);
  const totalMusicianEarned = musicianEarnings.reduce((s, e) => s + (e.totalEarned || 0), 0);

  const creatorTransactions = selectedCreator ? transactions.filter(t => t.creatorId === selectedCreator) : transactions;
  const formatUGX = (n: number) => `UGX ${n.toLocaleString()}`;

  const inputCls = "w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-foreground text-sm font-bold">Creator Earnings</h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCreditOpen(o => !o)} className="text-[9px] bg-primary text-primary-foreground px-2.5 py-1 rounded font-bold flex items-center gap-1">
            <Plus className="w-2.5 h-2.5" /> Manual Credit
          </button>
          <button onClick={fetchData} className="text-[9px] text-primary font-semibold flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> Refresh</button>
          <button onClick={handleResetCounts} disabled={resetting} className="text-[9px] bg-destructive text-destructive-foreground px-2.5 py-1 rounded font-bold disabled:opacity-50">
            {resetting ? "Resetting..." : "Reset All Content Counts"}
          </button>
        </div>
      </div>

      {/* Manual Credit Form */}
      {creditOpen && (
        <div className="bg-card border border-primary/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground text-xs font-bold flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-primary" /> Add Manual Earning</h3>
            <button onClick={() => setCreditOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
          <form onSubmit={handleManualCredit} className="space-y-3">
            <div>
              <label className="text-foreground text-[11px] font-semibold mb-1 block">Creator *</label>
              <select className={inputCls} value={creditCreatorId} onChange={e => setCreditCreatorId(e.target.value)}>
                <option value="">Select creator...</option>
                {earnings.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.creatorName} ({c.creatorRole === "vj" ? "VJ" : "Musician"}) — Balance: UGX {c.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-foreground text-[11px] font-semibold mb-1 block">Amount (UGX) *</label>
              <input className={inputCls} type="number" min="1" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="e.g. 5000" />
            </div>
            <div>
              <label className="text-foreground text-[11px] font-semibold mb-1 block">Reason / Note</label>
              <input className={inputCls} value={creditNote} onChange={e => setCreditNote(e.target.value)} placeholder="e.g. Bonus for event coverage" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={crediting} className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5">
                {crediting ? <><Loader2 className="w-3 h-3 animate-spin" /> Crediting...</> : <><Check className="w-3 h-3" /> Credit Earning</>}
              </button>
              <button type="button" onClick={() => setCreditOpen(false)} className="bg-secondary text-foreground px-4 py-1.5 rounded text-xs font-bold hover:bg-muted">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-card border border-border rounded p-3">
          <p className="text-[9px] text-muted-foreground">Total VJ Balance (owed)</p>
          <p className="text-primary text-lg font-bold">{formatUGX(totalVJBalance)}</p>
        </div>
        <div className="bg-card border border-border rounded p-3">
          <p className="text-[9px] text-muted-foreground">Total VJ Earned</p>
          <p className="text-foreground text-lg font-bold">{formatUGX(totalVJEarned)}</p>
        </div>
        <div className="bg-card border border-border rounded p-3">
          <p className="text-[9px] text-muted-foreground">Total Musician Balance</p>
          <p className="text-primary text-lg font-bold">{formatUGX(totalMusicianBalance)}</p>
        </div>
        <div className="bg-card border border-border rounded p-3">
          <p className="text-[9px] text-muted-foreground">Total Musician Earned</p>
          <p className="text-foreground text-lg font-bold">{formatUGX(totalMusicianEarned)}</p>
        </div>
      </div>

      {loading ? <p className="text-muted-foreground text-[10px]">Loading...</p> : (
        <>
          {/* VJ Earnings Table */}
          <div className="bg-card border border-border rounded p-3">
            <h3 className="text-foreground text-xs font-bold mb-2">VJ Earnings (UGX 250/download)</h3>
            {vjEarnings.length === 0 ? <p className="text-muted-foreground text-[10px]">No VJ earnings yet</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">VJ Name</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Downloads</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Earned</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Withdrawn</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Balance</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Actions</th>
                  </tr></thead>
                  <tbody>
                    {vjEarnings.map(e => (
                      <React.Fragment key={e.id}>
                        <tr className="border-b border-border last:border-0">
                          <td className="p-1.5 text-foreground font-semibold">{e.creatorName}</td>
                          <td className="p-1.5 text-muted-foreground">{e.totalDownloads}</td>
                          <td className="p-1.5 text-foreground font-bold">{formatUGX(e.totalEarned)}</td>
                          <td className="p-1.5 text-muted-foreground">{formatUGX(e.totalWithdrawn)}</td>
                          <td className="p-1.5 text-primary font-bold">{formatUGX(e.balance)}</td>
                          <td className="p-1.5">
                            <div className="flex gap-1 flex-wrap">
                              <button
                                onClick={() => { setAddDlVjId(addDlVjId === e.id ? null : e.id); setAddDlCount(""); setAddDlNote(""); }}
                                className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5"
                              >
                                <Download className="w-2.5 h-2.5" /> Add Downloads
                              </button>
                              <button onClick={() => setSelectedCreator(selectedCreator === e.id ? null : e.id)} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded">
                                {selectedCreator === e.id ? "Hide" : "Transactions"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {addDlVjId === e.id && (
                          <tr key={`${e.id}-dl`} className="bg-primary/5 border-b border-border">
                            <td colSpan={6} className="p-2">
                              <div className="flex items-end gap-2 flex-wrap">
                                <div>
                                  <label className="text-[10px] text-foreground font-semibold mb-0.5 block">Downloads to add *</label>
                                  <input
                                    type="number" min="1" value={addDlCount} onChange={e => setAddDlCount(e.target.value)}
                                    placeholder="e.g. 10"
                                    className="w-24 bg-secondary text-foreground text-xs px-2 py-1 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                  <label className="text-[10px] text-foreground font-semibold mb-0.5 block">Note (optional)</label>
                                  <input
                                    type="text" value={addDlNote} onChange={ev => setAddDlNote(ev.target.value)}
                                    placeholder="e.g. Correction for offline event"
                                    className="w-full bg-secondary text-foreground text-xs px-2 py-1 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                <div className="flex gap-1.5 items-center">
                                  {addDlCount && parseInt(addDlCount) > 0 && (
                                    <span className="text-[9px] text-primary font-semibold">+UGX {(parseInt(addDlCount) * 250).toLocaleString()}</span>
                                  )}
                                  <button
                                    disabled={addingDl} onClick={() => handleAddDownloads(e)}
                                    className="bg-primary text-primary-foreground px-3 py-1 rounded text-[10px] font-bold disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {addingDl ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />} Confirm
                                  </button>
                                  <button onClick={() => setAddDlVjId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Musician Earnings Table */}
          <div className="bg-card border border-border rounded p-3">
            <h3 className="text-foreground text-xs font-bold mb-2">Musician Earnings (UGX 50,000 at 10,000 downloads/month)</h3>
            {musicianEarnings.length === 0 ? <p className="text-muted-foreground text-[10px]">No musician earnings yet</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Musician</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Total Downloads</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Monthly</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Earned</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Balance</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Actions</th>
                  </tr></thead>
                  <tbody>
                    {musicianEarnings.map(e => (
                      <tr key={e.id} className="border-b border-border last:border-0">
                        <td className="p-1.5 text-foreground font-semibold">{e.creatorName}</td>
                        <td className="p-1.5 text-muted-foreground">{e.totalDownloads}</td>
                        <td className="p-1.5 text-muted-foreground">{e.monthlyDownloads} / 10,000</td>
                        <td className="p-1.5 text-foreground font-bold">{formatUGX(e.totalEarned)}</td>
                        <td className="p-1.5 text-primary font-bold">{formatUGX(e.balance)}</td>
                        <td className="p-1.5">
                          <button onClick={() => setSelectedCreator(selectedCreator === e.id ? null : e.id)} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded">
                            {selectedCreator === e.id ? "Hide" : "Transactions"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="bg-card border border-border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-foreground text-xs font-bold">
                {selectedCreator ? `Transactions for ${earnings.find(e => e.id === selectedCreator)?.creatorName}` : "All Transactions"}
              </h3>
              {selectedCreator && <button onClick={() => setSelectedCreator(null)} className="text-[9px] text-primary font-semibold">Show All</button>}
            </div>
            {creatorTransactions.length === 0 ? <p className="text-muted-foreground text-[10px]">No transactions</p> : (
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-[10px]">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Creator</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Type</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Amount</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Details</th>
                    <th className="text-left p-1.5 text-muted-foreground font-semibold">Date</th>
                  </tr></thead>
                  <tbody>
                    {creatorTransactions.slice(0, 50).map(tx => (
                      <tr key={tx.id} className="border-b border-border last:border-0">
                        <td className="p-1.5 text-foreground font-semibold">{tx.creatorName}</td>
                        <td className="p-1.5"><span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                          tx.type === "download_credit" ? "bg-green-500/20 text-green-400" :
                          tx.type === "withdrawal" ? "bg-yellow-500/20 text-yellow-400" :
                          tx.type === "admin_credit" ? "bg-blue-500/20 text-blue-400" :
                          "bg-primary/20 text-primary"
                        )}>{tx.type === "download_credit" ? "Download" : tx.type === "withdrawal" ? "Withdrawal" : tx.type === "admin_credit" ? "Admin Credit" : "Milestone"}</span></td>
                        <td className="p-1.5 text-foreground font-bold">{tx.type === "withdrawal" ? `-${formatUGX(tx.amount)}` : tx.amount > 0 ? `+${formatUGX(tx.amount)}` : "—"}</td>
                        <td className="p-1.5 text-muted-foreground truncate max-w-[200px]">{tx.note || tx.contentTitle || tx.phone || "—"}</td>
                        <td className="p-1.5 text-muted-foreground">{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
