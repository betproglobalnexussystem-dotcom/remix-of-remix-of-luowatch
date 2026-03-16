import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Share2, Download, Loader2 } from "lucide-react";
import { useMusicVideos } from "@/hooks/useFirestore";
import { incrementMusicPlays, logActivity, getMusicById } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { creditMusicianDownload, isAdminActivatedSub } from "@/lib/earnings";
import CommentSection from "@/components/CommentSection";
import MusicVideoPlayer from "@/components/MusicVideoPlayer";
import { toast } from "sonner";
import { updateDoc, doc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

const INTERNAL_ROLES = ["vj", "admin", "musician", "tiktoker"];

const MusicPlayerPage = () => {
  const { id } = useParams();
  // Use the real-time subscription — if user came from MusicPage, data is already loaded
  const { music: allMusic } = useMusicVideos();
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const { hasContentAccess, openSubModal } = useSubscription();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // video state — initialised from allMusic subscription or individual fetch
  const [video, setVideo] = useState<any | null>(null);
  const hasFetched = useRef(false);

  // Step 1: try to resolve from already-loaded subscription data immediately
  useEffect(() => {
    if (!id) return;
    const found = allMusic.find(m => m.id === id);
    if (found) { setVideo(found); return; }
  }, [id, allMusic]);

  // Step 2: if subscription hasn't delivered it yet, do a direct getDoc (fallback)
  useEffect(() => {
    if (!id || video || hasFetched.current) return;
    hasFetched.current = true;
    getMusicById(id).then(m => { if (m) setVideo(m); });
  }, [id, video]);

  // Log play once we have the video data
  useEffect(() => {
    if (!id || !video) return;
    incrementMusicPlays(id).catch(() => {});
    if (user) {
      logActivity({
        type: "view", contentType: "music", contentId: id,
        contentTitle: video.title, userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, !!video]);

  const relatedVideos = allMusic.filter(v => v.id !== id);

  const handleShare = async () => {
    if (!video) return;
    const url = window.location.href;
    if (user) logActivity({ type: "share", contentType: "music", contentId: id!, contentTitle: video.title, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
    if (navigator.share) {
      try { await navigator.share({ title: video.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  const handleDownload = async () => {
    if (!video) return;
    if (!user) { setAuthModalTab("login"); setShowAuthModal(true); return; }
    if (!hasContentAccess) { openSubModal("content"); return; }
    if (!video.videoUrl) { toast.error("No download available"); return; }

    const userRole = user.role?.toLowerCase() || "";
    const isCreatorOrAdmin = INTERNAL_ROLES.includes(userRole);

    if (!isCreatorOrAdmin) {
      try {
        const isAdminSub = await isAdminActivatedSub(user.id);
        if (!isAdminSub) {
          await updateDoc(doc(db, "music", id!), { downloads: increment(1) });
          if (video.musicianId && video.musicianId !== "admin") {
            creditMusicianDownload(
              video.musicianId, video.musicianName || video.artist,
              id!, video.title, user.id,
              `${user.firstName} ${user.lastName}`.trim() || user.email
            ).catch(() => {});
          }
        }
      } catch {}
    }

    logActivity({ type: "download", contentType: "music", contentId: id!, contentTitle: video.title, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});

    setDownloading(true);
    toast.info("Starting download...");
    try {
      const response = await fetch(video.videoUrl);
      if (!response.ok) throw new Error("Network error");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${video.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      toast.success("Download started!");
    } catch {
      window.open(video.videoUrl, "_blank");
      toast.info("Opened in new tab — use your browser's save option.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex gap-4">

          {/* Main */}
          <main className="flex-1 min-w-0">

            {/* Player area — always rendered immediately, no blocking loader */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-3 shadow-lg">
              {video?.videoUrl ? (
                <MusicVideoPlayer
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  title={video.title}
                  artist={video.musicianName || video.artist}
                />
              ) : video?.thumbnailUrl ? (
                /* Data loaded but no video URL — show thumbnail */
                <img src={video.thumbnailUrl} alt={video?.title || ""} className="w-full h-full object-cover" />
              ) : (
                /* Still loading data — show spinner inside player area, not full-screen */
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-white/50" />
                </div>
              )}
            </div>

            {/* Title skeleton while loading */}
            {video ? (
              <h1 className="text-foreground text-sm font-bold mb-2 leading-tight">{video.title}</h1>
            ) : (
              <div className="h-4 w-2/3 bg-secondary rounded animate-pulse mb-2" />
            )}

            {/* Artist row + actions */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              {video ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                    {(video.musicianName || video.artist)?.[0]?.toUpperCase() || "M"}
                  </div>
                  <div>
                    <span className="text-foreground text-[11px] font-bold">{video.musicianName || video.artist}</span>
                    {video.verified && <span className="text-muted-foreground text-[10px] ml-1">✓</span>}
                  </div>
                  <button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`ml-2 px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${isSubscribed ? "bg-secondary text-secondary-foreground" : "bg-foreground text-background"}`}
                  >
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>
                </div>
              ) : (
                <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5 text-[10px] text-foreground hover:bg-muted transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5 text-[10px] text-foreground hover:bg-muted transition-colors disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {downloading ? "Downloading..." : "Download"}
                </button>
              </div>
            </div>

            {/* Meta */}
            {video && (
              <div className="bg-secondary rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-[11px] text-foreground font-bold">
                  <span>{video.plays} plays</span>
                  {video.genre && <><span>·</span><span>{video.genre}</span></>}
                  {video.year && <><span>·</span><span>{video.year}</span></>}
                </div>
              </div>
            )}

            <CommentSection contentId={id || ""} contentType="music" />
          </main>

          {/* Related sidebar (desktop only) */}
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
