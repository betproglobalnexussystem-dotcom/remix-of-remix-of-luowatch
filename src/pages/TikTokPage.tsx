import { useTikTokVideos } from "@/hooks/useFirestore";
import LoadingScreen from "@/components/LoadingScreen";
import { incrementTikTokField, logActivity } from "@/lib/firestore";
import { Heart, MessageCircle, Share2, Bookmark, Music, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CreatorAuthModal from "@/components/CreatorAuthModal";

const TikTokPage = () => {
  const { videos, loading } = useTikTokVideos();
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTikTokerModal, setShowTikTokerModal] = useState(false);

  if (loading) return <LoadingScreen />;
  if (videos.length === 0) return <div className="h-[calc(100vh-40px)] bg-background flex items-center justify-center text-muted-foreground text-xs">No TikTok videos yet. TikTokers can upload from their dashboard.</div>;

  const video = videos[currentIndex];
  const goNext = () => setCurrentIndex((p) => Math.min(p + 1, videos.length - 1));
  const goPrev = () => setCurrentIndex((p) => Math.max(p - 1, 0));

  const handleLike = () => {
    if (!user) { setAuthModalTab("login"); setShowAuthModal(true); return; }
    incrementTikTokField(video.id, "likes").catch(() => {});
    logActivity({ type: "like", contentType: "tiktok", contentId: video.id, contentTitle: video.title || video.description, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
  };
  const handleShare = async () => {
    const url = window.location.href;
    if (user) logActivity({ type: "share", contentType: "tiktok", contentId: video.id, contentTitle: video.title || video.description, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
    if (navigator.share) { try { await navigator.share({ title: video.title, url }); } catch {} }
    else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
    incrementTikTokField(video.id, "shares").catch(() => {});
  };
  const handleSave = () => {
    if (!user) { setAuthModalTab("login"); setShowAuthModal(true); return; }
    incrementTikTokField(video.id, "saves").catch(() => {});
    logActivity({ type: "save", contentType: "tiktok", contentId: video.id, contentTitle: video.title || video.description, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
    toast.success("Saved!");
  };

  return (
    <div className="h-[calc(100vh-40px)] bg-background flex items-center justify-center">
      <div className="relative h-full max-h-[85vh] aspect-[9/16] bg-card rounded-lg overflow-hidden shadow-2xl">
        {video.videoUrl ? (
          <video src={video.videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.description} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center text-muted-foreground text-xs">No video</div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              {video.tiktokerAvatar ? <img src={video.tiktokerAvatar} alt="" className="w-full h-full object-cover" /> : video.tiktokerName?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Plus className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          </div>

          <button onClick={handleLike} className="flex flex-col items-center gap-0.5">
            <Heart className="w-5 h-5 text-foreground" />
            <span className="text-[9px] text-foreground font-semibold">{video.likes}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5">
            <MessageCircle className="w-5 h-5 text-foreground" />
            <span className="text-[9px] text-foreground font-semibold">{video.comments}</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-0.5">
            <Share2 className="w-5 h-5 text-foreground" />
            <span className="text-[9px] text-foreground font-semibold">{video.shares}</span>
          </button>
          <button onClick={handleSave} className="flex flex-col items-center gap-0.5">
            <Bookmark className="w-5 h-5 text-foreground" />
            <span className="text-[9px] text-foreground font-semibold">{video.saves}</span>
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-12">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-foreground text-xs font-bold">{video.tiktokerName}</span>
            {video.verified && <span className="text-primary text-[10px]">✓</span>}
          </div>
          <p className="text-foreground text-[10px] leading-tight mb-1.5">{video.description}</p>
          {video.music && (
            <div className="flex items-center gap-1">
              <Music className="w-2.5 h-2.5 text-foreground" />
              <p className="text-foreground text-[9px] truncate">{video.music}</p>
            </div>
          )}
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <button onClick={goPrev} disabled={currentIndex === 0} className="w-6 h-6 bg-secondary/60 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-secondary">
            <ChevronUp className="w-3.5 h-3.5 text-foreground" />
          </button>
          <button onClick={goNext} disabled={currentIndex === videos.length - 1} className="w-6 h-6 bg-secondary/60 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-secondary">
            <ChevronDown className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="ml-3 flex flex-col gap-2 max-h-[85vh] overflow-y-auto">
        {videos.map((v, i) => (
          <button key={v.id} onClick={() => setCurrentIndex(i)} className={`w-12 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-colors ${i === currentIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
            {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary" />}
          </button>
        ))}
        {!user && (
          <button
            onClick={() => setShowTikTokerModal(true)}
            className="w-12 h-16 rounded border-2 border-dashed border-primary/50 flex items-center justify-center flex-shrink-0 hover:border-primary transition-colors group"
            title="Join as TikToker"
          >
            <Plus className="w-4 h-4 text-primary/50 group-hover:text-primary" />
          </button>
        )}
      </div>
      {!user && (
        <button
          onClick={() => setShowTikTokerModal(true)}
          className="md:hidden fixed bottom-16 right-3 z-40 bg-primary text-primary-foreground px-3 py-2 rounded-full text-[10px] font-bold shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Join as TikToker
        </button>
      )}
      <CreatorAuthModal open={showTikTokerModal} onClose={() => setShowTikTokerModal(false)} role="tiktoker" />
    </div>
  );
};

export default TikTokPage;
