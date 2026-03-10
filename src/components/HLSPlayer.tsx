import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from "lucide-react";

interface HLSPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

const HLSPlayer = ({ src, poster, autoPlay = true }: HLSPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(true);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (src.includes(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else hls.destroy();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    } else {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src, autoPlay]);

  // Video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime);
    const onDuration = () => setDuration(video.duration);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onCanPlay = () => setBuffering(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDuration);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDuration);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play().catch(() => {}) : v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    if (val === 0) { v.muted = true; setMuted(true); }
    else { v.muted = false; setMuted(false); }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * duration;
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const fmt = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "--:--";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group cursor-pointer select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".player-controls")) return;
        togglePlay();
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        playsInline
      />

      {/* Buffering spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Big play button when paused */}
      {!playing && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* LIVE badge */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-destructive-foreground rounded-full animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Controls overlay */}
      <div
        className={`player-controls absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        <div className="relative px-3 pb-2 pt-8">
          {/* Progress bar */}
          {duration > 0 && (
            <div
              ref={progressRef}
              className="w-full h-1 bg-muted/40 rounded-full mb-2 cursor-pointer group/progress"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-primary rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          {/* Controls row */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="text-foreground hover:text-primary transition-colors"
            >
              {playing ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="text-foreground hover:text-primary transition-colors"
              >
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolume}
                onClick={(e) => e.stopPropagation()}
                className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-primary h-1 cursor-pointer"
              />
            </div>

            {/* Time */}
            <span className="text-foreground/80 text-[10px] font-mono ml-1">
              {fmt(currentTime)} / {fmt(duration)}
            </span>

            <div className="flex-1" />

            {/* Fullscreen */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="text-foreground hover:text-primary transition-colors"
            >
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HLSPlayer;
