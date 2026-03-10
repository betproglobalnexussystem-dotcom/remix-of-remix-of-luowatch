import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Upload, Music, List, Wallet, ArrowDownToLine,
  Receipt, Download, ChevronLeft, Plus, Edit2, Check, X,
  DollarSign, BarChart3, Play, Trash2, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useMusicianVideos } from "@/hooks/useFirestore";
import { addMusicVideo, deleteMusicVideo, updateMusicVideo } from "@/lib/firestore";
import { sendWithdrawal, formatPhone } from "@/lib/payments";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "upload", label: "Upload Music Video", icon: Upload },
  { id: "manage", label: "Manage Videos", icon: List },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

const MusicianDashboard = () => {
  const { user } = useAuth();
  const { music: videos, loading } = useMusicianVideos(user?.id || "");
  const [activeTab, setActiveTab] = useState("overview");

  const [vTitle, setVTitle] = useState(""); const [vArtist, setVArtist] = useState(""); const [vGenre, setVGenre] = useState("Afrobeat");
  const [vYear, setVYear] = useState(""); const [vDuration, setVDuration] = useState(""); const [vThumbUrl, setVThumbUrl] = useState(""); const [vVideoUrl, setVVideoUrl] = useState("");

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Wallet
  const [wPhone, setWPhone] = useState(""); const [wAmount, setWAmount] = useState(""); const [withdrawing, setWithdrawing] = useState(false);

  const totalPlays = videos.reduce((s, v) => s + (v.plays || 0), 0);
  const totalDownloads = videos.reduce((s, v) => s + (v.downloads || 0), 0);
  const totalEarned = Math.floor(totalDownloads / 20) * 5000;
  const balance = totalEarned;

  const now = new Date();
  const isSaturday = now.getDay() === 6;
  const isWithdrawWindow = isSaturday && now.getHours() >= 12;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle || !vVideoUrl || !user) { toast.error("Title and video link required"); return; }
    try {
      await addMusicVideo({
        title: vTitle, artist: vArtist || `${user.firstName} ${user.lastName}`.trim(), genre: vGenre,
        year: vYear, duration: vDuration, thumbnailUrl: vThumbUrl, videoUrl: vVideoUrl,
        musicianId: user.id, musicianName: `${user.firstName} ${user.lastName}`.trim() || user.email, verified: true,
      });
      setVTitle(""); setVArtist(""); setVYear(""); setVDuration(""); setVThumbUrl(""); setVVideoUrl("");
      toast.success("Music video uploaded!");
    } catch { toast.error("Upload failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await deleteMusicVideo(id); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  const handleSaveEdit = async (id: string) => {
    try { await updateMusicVideo(id, editData); setEditId(null); toast.success("Updated!"); } catch { toast.error("Failed"); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWithdrawWindow) { toast.error("Withdrawals only on Saturdays 12PM - Midnight"); return; }
    if (!wPhone || !wAmount || Number(wAmount) > balance) { toast.error("Invalid amount or phone"); return; }
    setWithdrawing(true);
    try {
      const res = await sendWithdrawal(formatPhone(wPhone), Number(wAmount), "Musician earnings withdrawal");
      if (res.success) { toast.success("Withdrawal initiated!"); setWPhone(""); setWAmount(""); }
      else toast.error(res.message || "Failed");
    } catch { toast.error("Withdrawal failed"); }
    setWithdrawing(false);
  };

  const formatUGX = (n: number) => `UGX ${n.toLocaleString()}`;
  const inputCls = "w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary";

  const stats = [
    { label: "Total Videos", value: String(videos.length), icon: Music, color: "text-primary" },
    { label: "Total Plays", value: String(totalPlays), icon: Play, color: "text-badge-hd" },
    { label: "Downloads", value: String(totalDownloads), icon: Download, color: "text-badge-new" },
    { label: "Balance", value: formatUGX(balance), icon: DollarSign, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-48 bg-card border-r border-border min-h-screen flex-shrink-0 hidden md:block">
          <div className="p-3 border-b border-border"><Link to="/" className="text-primary text-xs font-bold flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Back to LUO WATCH</Link></div>
          <div className="p-2">
            <p className="text-[9px] text-muted-foreground uppercase font-bold px-2 mb-2">Musician Dashboard</p>
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
          {activeTab === "overview" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {stats.map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2"><s.icon className={cn("w-4 h-4", s.color)} /><BarChart3 className="w-3 h-3 text-muted-foreground" /></div>
                    <p className="text-foreground text-base font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              {videos.length > 0 && (
                <>
                  <h3 className="text-foreground text-xs font-bold mb-2">Recent Uploads</h3>
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead><tr className="border-b border-border"><th className="text-left text-muted-foreground font-semibold p-2">Title</th><th className="text-left text-muted-foreground font-semibold p-2">Plays</th><th className="text-left text-muted-foreground font-semibold p-2">Status</th></tr></thead>
                      <tbody>{videos.slice(0, 5).map(v => (<tr key={v.id} className="border-b border-border last:border-0"><td className="p-2 text-foreground font-semibold">{v.title}</td><td className="p-2 text-muted-foreground">{v.plays}</td><td className="p-2"><span className="text-[9px] bg-badge-new text-primary-foreground px-1.5 py-0.5 rounded font-bold">Published</span></td></tr>))}</tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "upload" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Upload Music Video</h2>
              <div className="bg-card border border-border rounded-lg p-4 max-w-lg">
                <form className="space-y-3" onSubmit={handleUpload}>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Song Title *</label><input className={inputCls} placeholder="Enter song title" value={vTitle} onChange={e => setVTitle(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Artist Name</label><input className={inputCls} placeholder="Artist name" value={vArtist} onChange={e => setVArtist(e.target.value)} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Genre</label><select className={inputCls} value={vGenre} onChange={e => setVGenre(e.target.value)}><option>Afrobeat</option><option>Hip Hop</option><option>Gospel</option><option>Dancehall</option><option>RnB</option><option>Traditional</option></select></div>
                    <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Year</label><input className={inputCls} placeholder="2026" value={vYear} onChange={e => setVYear(e.target.value)} /></div>
                    <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Duration</label><input className={inputCls} placeholder="3:45" value={vDuration} onChange={e => setVDuration(e.target.value)} /></div>
                  </div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Thumbnail URL</label><input className={inputCls} placeholder="https://..." value={vThumbUrl} onChange={e => setVThumbUrl(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Music Video Link *</label><input className={inputCls} placeholder="https://..." value={vVideoUrl} onChange={e => setVVideoUrl(e.target.value)} /></div>
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Upload Video</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "manage" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Manage Videos</h2>
              {videos.length === 0 ? <p className="text-muted-foreground text-xs">No videos yet.</p> : (
                <div className="grid gap-2">
                  {videos.map(v => (
                    <div key={v.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                      <div className="w-12 h-8 rounded overflow-hidden flex-shrink-0 bg-secondary">
                        {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      {editId === v.id ? (
                        <div className="flex-1 space-y-1">
                          <input className={inputCls} value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Title" />
                          <input className={inputCls} value={editData.artist || ""} onChange={e => setEditData({ ...editData, artist: e.target.value })} placeholder="Artist" />
                          <input className={inputCls} value={editData.videoUrl || ""} onChange={e => setEditData({ ...editData, videoUrl: e.target.value })} placeholder="Video URL" />
                          <input className={inputCls} value={editData.thumbnailUrl || ""} onChange={e => setEditData({ ...editData, thumbnailUrl: e.target.value })} placeholder="Thumbnail URL" />
                          <div className="flex gap-1">
                            <button onClick={() => handleSaveEdit(v.id)} className="text-[9px] bg-primary text-primary-foreground px-2 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Save</button>
                            <button onClick={() => setEditId(null)} className="text-[9px] bg-secondary text-foreground px-2 py-0.5 rounded"><X className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-foreground text-[11px] font-bold truncate">{v.title}</h4>
                            <p className="text-muted-foreground text-[9px]">{v.artist} • {v.genre} • {v.plays} plays</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditId(v.id); setEditData({ title: v.title, artist: v.artist, genre: v.genre, videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl }); }} className="text-[9px] bg-secondary text-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Edit2 className="w-2.5 h-2.5" /> Edit</button>
                            <button onClick={() => handleDelete(v.id)} className="text-[9px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Trash2 className="w-2.5 h-2.5" /> Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "wallet" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Wallet</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-card border border-border rounded-lg p-4"><p className="text-[10px] text-muted-foreground mb-1">Available Balance</p><p className="text-primary text-xl font-bold">{formatUGX(balance)}</p></div>
                <div className="bg-card border border-border rounded-lg p-4"><p className="text-[10px] text-muted-foreground mb-1">Total Earned</p><p className="text-foreground text-xl font-bold">{formatUGX(totalEarned)}</p></div>
                <div className="bg-card border border-border rounded-lg p-4"><p className="text-[10px] text-muted-foreground mb-1">Downloads</p><p className="text-foreground text-xl font-bold">{totalDownloads}</p></div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 max-w-sm">
                <h3 className="text-foreground text-xs font-bold mb-2">Withdraw to Mobile Money</h3>
                {!isWithdrawWindow && <p className="text-destructive text-[10px] mb-2">⚠ Withdrawals open Saturdays 12PM - Midnight</p>}
                <form className="space-y-3" onSubmit={handleWithdraw}>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Amount (UGX)</label><input className={inputCls} value={wAmount} onChange={e => setWAmount(e.target.value)} placeholder="Enter amount" type="number" /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Mobile Money Number</label><input className={inputCls} value={wPhone} onChange={e => setWPhone(e.target.value)} placeholder="0770 000 000" /></div>
                  <button type="submit" disabled={withdrawing || !isWithdrawWindow || balance === 0} className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    {withdrawing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</> : <><ArrowDownToLine className="w-3.5 h-3.5" /> Withdraw</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MusicianDashboard;
