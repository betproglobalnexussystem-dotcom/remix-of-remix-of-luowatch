import { Link } from "react-router-dom";
import { useChannels } from "@/hooks/useFirestore";

const LiveTVPage = () => {
  const { channels, loading } = useChannels();

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <h1 className="text-foreground text-base font-bold mb-4 flex items-center gap-2">
          <span className="text-primary">●</span> Live TV Channels
        </h1>

        {loading ? (
          <p className="text-muted-foreground text-[10px]">Loading channels...</p>
        ) : channels.length === 0 ? (
          <p className="text-muted-foreground text-[10px]">No TV channels yet. VJs can add channels from their dashboard.</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {channels.map((channel) => (
              <Link
                to={`/live-tv/${channel.id}`}
                key={channel.id}
                className="relative rounded-lg overflow-hidden cursor-pointer group bg-card aspect-[16/10] flex items-center justify-center border border-border hover:scale-105 transition-transform duration-200"
              >
                {channel.logoUrl ? (
                  <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">{channel.name}</div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-background/70 px-2 py-1">
                  <p className="text-foreground text-[10px] font-bold text-center truncate">{channel.name}</p>
                </div>
                {channel.isLive && (
                  <span className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <span className="w-1 h-1 bg-primary-foreground rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTVPage;
