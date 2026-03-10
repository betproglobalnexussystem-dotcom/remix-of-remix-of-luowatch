import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Upload, List, Wallet, ArrowDownToLine,
  Receipt, Eye, Download, ChevronLeft, Plus,
  DollarSign, BarChart3, Clapperboard, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTikTokerVideos } from "@/hooks/useFirestore";
import { addTikTokVideo, deleteTikTokVideo } from "@/lib/firestore";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "upload", label: "Upload Video", icon: Upload },
  { id: "manage", label: "Manage Videos", icon: List },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "withdraw", label: "Withdraw", icon: ArrowDownToLine },
  { id: "transactions", label: "Transactions", icon: Receipt },
];

const TikTokerDashboard = () => {
  const { user } = useAuth();
  const { videos, loading } = useTikTokerVideos(user?.id || "");
  const [activeTab, setActiveTab] = useState("overview");

  const [vTitle, setVTitle] = useState("");
  const [vDesc, setVDesc] = useState("");
  const [vVideoUrl, setVVideoUrl] = useState("");
  const [vThumbUrl, setVThumbUrl] = useState("");
  const [vMusic, setVMusic] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle || !vVideoUrl || !user) { toast.error("Title and video link required"); return; }
    try {
      await addTikTokVideo({
        title: vTitle, description: vDesc, videoUrl: vVideoUrl,
        thumbnailUrl: vThumbUrl, music: vMusic,
        tiktokerId: user.id,
        tiktokerName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        tiktokerAvatar: "",
        verified: true,
      });
      setVTitle(""); setVDesc(""); setVVideoUrl(""); setVThumbUrl(""); setVMusic("");
      toast.success("Video uploaded!");
    } catch { toast.error("Upload failed"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteTikTokVideo(id); toast.success("Deleted"); } catch { toast.error("Delete failed"); }
  };

  const stats = [
    { label: "Total Videos", value: String(videos.length), icon: Clapperboard, color: "text-primary" },
    { label: "Total Views", value: String(videos.reduce((s, v) => s + (v.views || 0), 0)), icon: Eye, color: "text-badge-hd" },
    { label: "Downloads", value: "0", icon: Download, color: "text-badge-new" },
    { label: "Balance", value: "UGX 0", icon: DollarSign, color: "text-accent" },
  ];

  const inputCls = "w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-48 bg-card border-r border-border min-h-screen flex-shrink-0 hidden md:block">
          <div className="p-3 border-b border-border"><Link to="/" className="text-primary text-xs font-bold flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Back to LUO WATCH</Link></div>
          <div className="p-2">
            <p className="text-[9px] text-muted-foreground uppercase font-bold px-2 mb-2">TikToker Dashboard</p>
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
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead><tr className="border-b border-border"><th className="text-left text-muted-foreground font-semibold p-2">Title</th><th className="text-left text-muted-foreground font-semibold p-2">Views</th><th className="text-left text-muted-foreground font-semibold p-2">Likes</th></tr></thead>
                    <tbody>{videos.slice(0, 5).map(v => (<tr key={v.id} className="border-b border-border last:border-0"><td className="p-2 text-foreground font-semibold">{v.title}</td><td className="p-2 text-muted-foreground">{v.views}</td><td className="p-2 text-muted-foreground">{v.likes}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "upload" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Upload TikTok Video</h2>
              <div className="bg-card border border-border rounded-lg p-4 max-w-lg">
                <form className="space-y-3" onSubmit={handleUpload}>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Video Title *</label><input className={inputCls} placeholder="Enter video title" value={vTitle} onChange={e => setVTitle(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Description</label><textarea className={`${inputCls} h-20 resize-none`} placeholder="Description..." value={vDesc} onChange={e => setVDesc(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Video Link *</label><input className={inputCls} placeholder="https://..." value={vVideoUrl} onChange={e => setVVideoUrl(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Thumbnail URL</label><input className={inputCls} placeholder="https://..." value={vThumbUrl} onChange={e => setVThumbUrl(e.target.value)} /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Music/Sound</label><input className={inputCls} placeholder="♫ Sound name" value={vMusic} onChange={e => setVMusic(e.target.value)} /></div>
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Upload Video</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "manage" && (
            <div>
              <h2 className="text-foreground text-sm font-bold mb-4">Manage Videos</h2>
              {videos.length === 0 ? <p className="text-muted-foreground text-xs">No videos yet.</p> : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead><tr className="border-b border-border"><th className="text-left text-muted-foreground font-semibold p-2">Title</th><th className="text-left text-muted-foreground font-semibold p-2">Views</th><th className="text-left text-muted-foreground font-semibold p-2">Actions</th></tr></thead>
                    <tbody>{videos.map(v => (<tr key={v.id} className="border-b border-border last:border-0"><td className="p-2 text-foreground font-semibold">{v.title}</td><td className="p-2 text-muted-foreground">{v.views}</td><td className="p-2"><button onClick={() => handleDelete(v.id)} className="text-[9px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded flex items-center gap-0.5"><Trash2 className="w-2.5 h-2.5" /> Delete</button></td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "wallet" && (
            <div><h2 className="text-foreground text-sm font-bold mb-4">Wallet</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-lg p-4"><p className="text-[10px] text-muted-foreground mb-1">Available</p><p className="text-foreground text-xl font-bold">UGX 0</p></div>
                <div className="bg-card border border-border rounded-lg p-4"><p className="text-[10px] text-muted-foreground mb-1">Earned</p><p className="text-foreground text-xl font-bold">UGX 0</p></div>
                <div className="bg-card border border-border rounded-lg p-4"><p className="text-[10px] text-muted-foreground mb-1">Withdrawn</p><p className="text-foreground text-xl font-bold">UGX 0</p></div>
              </div>
            </div>
          )}

          {activeTab === "withdraw" && (
            <div><h2 className="text-foreground text-sm font-bold mb-4">Withdraw</h2>
              <div className="bg-card border border-border rounded-lg p-4 max-w-sm">
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); toast.success("Withdrawal submitted!"); }}>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Amount (UGX)</label><input className={inputCls} placeholder="Enter amount" /></div>
                  <div><label className="text-foreground text-[11px] font-semibold mb-1 block">Mobile Money</label><input className={inputCls} placeholder="0770 000 000" /></div>
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors">Withdraw</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div><h2 className="text-foreground text-sm font-bold mb-4">Transactions</h2><p className="text-muted-foreground text-xs">Transaction history will appear here.</p></div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TikTokerDashboard;
