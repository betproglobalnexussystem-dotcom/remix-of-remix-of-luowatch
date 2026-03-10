import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

const getStreamUrl = (url: string): string => {
  if (!url) return "";
  // Extract Google Drive file ID
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

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const ModernPlayer = ({ src, poster, title, autoPlay = false }: ModernPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const streamUrl = getStreamUrl(src);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * duration;
  }, [duration]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    if (val > 0) { v.muted = false; setMuted(false); }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const skip = (seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + seconds, duration));
  };

  const setSpeed = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = () => { setCurrentTime(v.currentTime); setProgress((v.currentTime / v.duration) * 100); };
    const onDur = () => setDuration(v.duration);
    const onPlay = () => { setPlaying(true); setLoading(false); };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => { setBuffering(false); setLoading(false); };
    const onCanPlay = () => { setLoading(false); setBuffering(false); };
    const onProgress = () => {
      if (v.buffered.length > 0) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
      }
    };
    const onError = () => setError(true);
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onDur);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("progress", onProgress);
    v.addEventListener("error", onError);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onDur);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("error", onError);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [streamUrl]);

  useEffect(() => {
    if (playing && !buffering) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [playing, buffering, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  if (error) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
          <Play className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-foreground text-xs font-semibold">Unable to load video</p>
        <button onClick={() => { setError(false); setLoading(true); videoRef.current?.load(); }} className="text-[10px] bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => { if ((e.target as HTMLElement).closest('.player-controls')) return; togglePlay(); }}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        poster={poster}
        preload="metadata"
        playsInline
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
      />

      {/* Loading / Buffering spinner */}
      {(loading || buffering) && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="relative">
            {/* YouTube-style spinner */}
            <div className="w-16 h-16 rounded-full border-[3px] border-muted-foreground/20 border-t-primary animate-spin" />
          </div>
        </div>
      )}

      {/* Big play button */}
      {!playing && !loading && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-lg shadow-primary/30 pointer-events-auto cursor-pointer" onClick={togglePlay}>
            <Play className="w-7 h-7 md:w-9 md:h-9 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className={cn(
        "player-controls absolute bottom-0 left-0 right-0 z-30 transition-all duration-300",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}>
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        <div className="relative px-3 pb-3 pt-8">
          {/* Title */}
          {title && (
            <p className="text-foreground text-[11px] font-semibold mb-2 truncate drop-shadow-sm">{title}</p>
          )}

          {/* Progress bar */}
          <div className="relative h-1 group/progress cursor-pointer mb-2 hover:h-1.5 transition-all" onClick={seek}>
            <div className="absolute inset-0 bg-muted-foreground/20 rounded-full" />
            <div className="absolute inset-y-0 left-0 bg-muted-foreground/40 rounded-full" style={{ width: `${buffered}%` }} />
            <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-sm opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="text-foreground hover:text-primary transition-colors">
              {playing ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>

            <button onClick={() => skip(-10)} className="text-foreground/80 hover:text-foreground transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => skip(10)} className="text-foreground/80 hover:text-foreground transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 group/vol">
              <button onClick={toggleMute} className="text-foreground/80 hover:text-foreground transition-colors">
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={changeVolume}
                className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-primary h-1 cursor-pointer"
              />
            </div>

            <span className="text-foreground/70 text-[10px] font-mono ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Speed / Settings */}
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className="text-foreground/80 hover:text-foreground transition-colors text-[10px] font-bold">
                {playbackRate !== 1 ? `${playbackRate}x` : <Settings className="w-4 h-4" />}
              </button>
              {showSettings && (
                <div className="absolute bottom-8 right-0 bg-card/95 backdrop-blur-xl border border-border rounded-lg p-2 shadow-xl min-w-[100px]" onClick={e => e.stopPropagation()}>
                  <p className="text-[9px] text-muted-foreground font-semibold mb-1 px-1">Speed</p>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                    <button key={r} onClick={() => setSpeed(r)} className={cn("block w-full text-left px-2 py-1 rounded text-[10px] transition-colors", playbackRate === r ? "bg-primary text-primary-foreground font-bold" : "text-foreground hover:bg-secondary")}>
                      {r === 1 ? "Normal" : `${r}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFullscreen} className="text-foreground/80 hover:text-foreground transition-colors">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPlayer;
