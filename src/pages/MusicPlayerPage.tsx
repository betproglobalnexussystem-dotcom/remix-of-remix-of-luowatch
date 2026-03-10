import { useParams } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import { useState, useEffect } from "react";
import { Share2, Download } from "lucide-react";
import { useMusicById, useMusicVideos } from "@/hooks/useFirestore";
import { incrementMusicPlays, logActivity, getMusicById } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import CommentSection from "@/components/CommentSection";
import LuoWatchPlayer from "@/components/LuoWatchPlayer";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const MusicPlayerPage = () => {
  const { id } = useParams();
  const { music: video, loading } = useMusicById(id || "");
  const { music: allMusic } = useMusicVideos();
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const { hasContentAccess, openSubModal } = useSubscription();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (id) {
      incrementMusicPlays(id).catch(() => {});
      if (user) {
        getMusicById(id).then(m => {
          if (m) logActivity({ type: "view", contentType: "music", contentId: id, contentTitle: m.title, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
        });
      }
    }
  }, [id, user]);

  if (loading) return <LoadingScreen />;
  if (!video) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Video not found</div>;

  const relatedVideos = allMusic.filter(v => v.id !== id);

  const handleShare = async () => {
    const url = window.location.href;
    if (user) logActivity({ type: "share", contentType: "music", contentId: id!, contentTitle: video.title, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
    if (navigator.share) {
      try { await navigator.share({ title: video.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  const handleDownload = () => {
    if (!user) { setAuthModalTab("login"); setShowAuthModal(true); return; }
    if (!hasContentAccess) { openSubModal("content"); return; }
    if (video.videoUrl) {
      if (user) logActivity({ type: "download", contentType: "music", contentId: id!, contentTitle: video.title, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
      // Use worker for Google Drive URLs
      const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/];
      let fileId: string | null = null;
      for (const p of patterns) { const m = video.videoUrl.match(p); if (m) { fileId = m[1]; break; } }
      if (fileId) {
        const fileName = encodeURIComponent(`${video.title}.mp4`);
        window.location.href = `https://black-band-8860.arthurdimpoz.workers.dev/download?fileId=${fileId}&fileName=${fileName}`;
      } else {
        window.location.href = video.videoUrl;
      }
    } else {
      toast.error("No download link");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex gap-4">
          <main className="flex-1 min-w-0">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-3">
              {video.videoUrl ? (
                <ArtPlayerComponent src={video.videoUrl} poster={video.thumbnailUrl} title={video.title} />
              ) : video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No video</div>
              )}
            </div>

            <h1 className="text-foreground text-sm font-bold mb-2 leading-tight">{video.title}</h1>

            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                  {video.musicianName?.[0]?.toUpperCase() || "M"}
                </div>
                <div>
                  <span className="text-foreground text-[11px] font-bold">{video.musicianName || video.artist}</span>
                  {video.verified && <span className="text-muted-foreground text-[10px] ml-1">✓</span>}
                </div>
                <button onClick={() => setIsSubscribed(!isSubscribed)} className={`ml-2 px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${isSubscribed ? "bg-secondary text-secondary-foreground" : "bg-foreground text-background"}`}>
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleShare} className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5 text-[10px] text-foreground hover:bg-muted">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button onClick={handleDownload} className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5 text-[10px] text-foreground hover:bg-muted">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-[11px] text-foreground font-bold mb-1">
                <span>{video.plays} plays</span>
                <span>· {video.genre}</span>
                <span>· {video.year}</span>
              </div>
            </div>

            <CommentSection contentId={id || ""} contentType="music" />
          </main>

          <aside className="w-72 flex-shrink-0 space-y-2 hidden md:block">
            {relatedVideos.map((v) => (
              <Link to={`/music/${v.id}`} key={v.id} className="flex gap-2 group">
                <div className="relative w-40 flex-shrink-0">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt="" className="w-full aspect-video object-cover rounded group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full aspect-video bg-secondary rounded" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-[10px] font-semibold leading-tight line-clamp-2">{v.title}</p>
                  <p className="text-muted-foreground text-[9px] mt-1">{v.musicianName || v.artist}</p>
                  <p className="text-muted-foreground text-[9px]">{v.plays} plays</p>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerPage;
