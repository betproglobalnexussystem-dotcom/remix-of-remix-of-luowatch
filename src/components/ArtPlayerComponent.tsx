import { useEffect, useRef } from "react";
import Artplayer from "artplayer";

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
  const playerRef = useRef<Artplayer | null>(null);
  const streamUrl = getStreamUrl(src);

  useEffect(() => {
    if (!artRef.current) return;

    playerRef.current = new Artplayer({
      container: artRef.current,
      url: streamUrl,
      poster: poster || "",
      title: title || "",
      volume: 0.7,
      autoplay: false,
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
      subtitleOffset: false,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: "hsl(var(--primary))",
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy(false);
        playerRef.current = null;
      }
    };
  }, [streamUrl, poster, title]);

  return <div ref={artRef} className="w-full h-full" />;
};

export default ArtPlayerComponent;
