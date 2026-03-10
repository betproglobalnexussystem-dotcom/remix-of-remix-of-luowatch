import { useParams, Link } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import { useState, useEffect } from "react";
import { Play, Share2, Lock, LogIn } from "lucide-react";
import { getChannelById, FireChannel } from "@/lib/firestore";
import { useChannels } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import CommentSection from "@/components/CommentSection";
import HLSPlayer from "@/components/HLSPlayer";
import { toast } from "sonner";

const TVPlayerPage = () => {
  const { id } = useParams();
  const [channel, setChannel] = useState<FireChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const { channels } = useChannels();
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const { hasContentAccess, openSubModal } = useSubscription();

  const canWatch = !!user && hasContentAccess;

  useEffect(() => {
    if (!id) return;
    const hardcoded = channels.find(c => c.id === id);
    if (hardcoded) {
      setChannel(hardcoded);
      setLoading(false);
    } else {
      getChannelById(id).then(ch => { setChannel(ch); setLoading(false); });
    }
  }, [id, channels]);

  if (loading) return <LoadingScreen />;
  if (!channel) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Channel not found</div>;

  const otherChannels = channels.filter(c => c.id !== id);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: channel.name, url }); } catch {} }
    else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
  };

  const handlePlayerClick = () => {
    if (!user) { setAuthModalTab("login"); setShowAuthModal(true); }
    else if (!hasContentAccess) { openSubModal("content"); }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex gap-4">
          <main className="flex-1 min-w-0">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-3">
              {canWatch && channel.streamUrl ? (
                <HLSPlayer src={channel.streamUrl} poster={channel.logoUrl} />
              ) : (
                <div className="relative w-full h-full cursor-pointer" onClick={handlePlayerClick}>
                  {channel.logoUrl && <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-cover opacity-40" />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    {!user ? (
                      <>
                        <LogIn className="w-8 h-8 text-primary" />
                        <span className="text-foreground text-xs font-bold">Login to Watch</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-8 h-8 text-primary" />
                        <span className="text-foreground text-xs font-bold">Subscribe to Watch</span>
                        <span className="text-muted-foreground text-[10px]">From UGX 2,000/day</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              {channel.isLive && canWatch && (
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" /> LIVE
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3 text-[11px] text-muted-foreground">
              <button onClick={handleShare} className="flex items-center gap-1 hover:text-foreground"><Share2 className="w-3.5 h-3.5" /> Share</button>
            </div>

            <h1 className="text-foreground text-base font-bold mb-1">{channel.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              {channel.isLive && <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-bold">LIVE NOW</span>}
              <span className="text-muted-foreground text-[10px]">Live TV Channel</span>
            </div>

            {channel.description && (
              <p className="text-muted-foreground text-[11px] leading-relaxed mb-4">{channel.description}</p>
            )}

            {otherChannels.length > 0 && (
              <div className="mb-6">
                <h2 className="text-foreground text-xs font-bold mb-2">More Channels</h2>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {otherChannels.slice(0, 12).map((ch) => (
                    <Link to={`/live-tv/${ch.id}`} key={ch.id} className="relative rounded overflow-hidden bg-card aspect-[16/10] flex items-center justify-center group hover:scale-105 transition-transform border border-border">
                      {ch.logoUrl ? <img src={ch.logoUrl} alt={ch.name} className="w-full h-full object-cover" /> : <span className="text-muted-foreground text-[8px]">{ch.name}</span>}
                      <div className="absolute bottom-0 left-0 right-0 bg-background/70 px-1 py-0.5">
                        <p className="text-foreground text-[8px] font-bold text-center truncate">{ch.name}</p>
                      </div>
                      {ch.isLive && <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[7px] font-bold px-1 py-0.5 rounded-full">LIVE</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <CommentSection contentId={id || ""} contentType="channel" />
          </main>

          <aside className="w-56 flex-shrink-0 hidden md:block">
            <div className="bg-card rounded p-3 border border-border">
              <h3 className="text-foreground text-xs font-bold mb-2">All Channels</h3>
              <div className="space-y-1">
                {channels.slice(0, 10).map((ch) => (
                  <Link key={ch.id} to={`/live-tv/${ch.id}`} className="flex items-center gap-2 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${ch.isLive ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <span className="text-primary text-[10px] hover:underline truncate">{ch.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TVPlayerPage;
