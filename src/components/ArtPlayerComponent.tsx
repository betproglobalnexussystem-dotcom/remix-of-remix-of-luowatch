import { useEffect, useRef, useState } from "react";

interface ArtPlayerComponentProps {
  src: string;
  poster?: string;
  title?: string;
}

const getStreamUrl = (url: string): string => {
  if (!url) return "";
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const fileId = match[1];
      return `https://black-band-8860.arthurdimpoz.workers.dev/download?fileId=${fileId}&fileName=stream.mp4`;
    }
  }
  return url;
};

const ArtPlayerComponent = ({ src, poster, title }: ArtPlayerComponentProps) => {
  const artRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const streamUrl = getStreamUrl(src);

  useEffect(() => {
    if (!artRef.current || !streamUrl) return;

    setIsLoading(true);
    setHasError(false);

    let cancelled = false;

    import("artplayer").then((mod) => {
      const Artplayer = mod.default;

      if (cancelled || !artRef.current) return;

      if (playerRef.current) {
        playerRef.current.destroy(false);
        playerRef.current = null;
      }

      const player = new (Artplayer as any)({
        container: artRef.current,
        url: streamUrl,
        poster: poster || "",
        volume: 0.7,
        autoplay: true,
        pip: true,
        autoSize: false,
        autoMini: true,
        screenshot: false,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        airplay: true,
        theme: "#e11d48",
        fastForward: true,
      });

      player.on("ready", () => {
        if (!cancelled) setIsLoading(false);
      });

      player.on("video:canplay", () => {
        if (!cancelled) setIsLoading(false);
      });

      player.on("error", () => {
        if (!cancelled) {
          setIsLoading(false);
          setHasError(true);
        }
      });

      // Fallback: hide loading after 5s regardless
      setTimeout(() => {
        if (!cancelled) setIsLoading(false);
      }, 5000);

      playerRef.current = player;
    }).catch(() => {
      if (!cancelled) {
        setIsLoading(false);
        setHasError(true);
      }
    });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.destroy(false);
        playerRef.current = null;
      }
    };
  }, [streamUrl, poster]);

  return (
    <div className="relative w-full h-full">
      <div ref={artRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground text-[10px]">Loading video...</span>
          </div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <span className="text-muted-foreground text-xs">Failed to load video. Try refreshing.</span>
        </div>
      )}
    </div>
  );
};

export default ArtPlayerComponent;
