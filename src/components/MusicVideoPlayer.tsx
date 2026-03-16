import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, Loader2, AlertCircle, RotateCcw } from "lucide-react";

interface MusicVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  artist?: string;
}

const fmt = (s: number) => {
  if (!isFinite(s) || isNaN(s) || s < 0) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const MusicVideoPlayer = ({ src, poster, title, artist }: MusicVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const isDragging = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Show/hide controls timer
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => { setPlaying(true); resetHideTimer(); };
    const onPause = () => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current); };
    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onDuration = () => setDuration(v.duration);
    const onProgress = () => {
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onCanPlay = () => setLoading(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onError = () => { setLoading(false); setError(true); };
    const onEnded = () => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current); };

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDuration);
    v.addEventListener("progress", onProgress);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("error", onError);
    v.addEventListener("ended", onEnded);

    return () => {
      clearTimeout(hideTimer.current);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("durationchange", onDuration);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("error", onError);
      v.removeEventListener("ended", onEnded);
    };
  }, [resetHideTimer]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || error) return;
    v.paused ? v.play().catch(() => {}) : v.pause();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen().catch(() => {});
  };

  const seekToRatio = (ratio: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.max(0, Math.min(1, ratio)) * duration;
  };

  const getRatioFromEvent = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const bar = seekBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent | React.MouseEvent).clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleSeekStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    seekToRatio(getRatioFromEvent(e));

    const onMove = (ev: MouseEvent | TouchEvent) => { if (isDragging.current) seekToRatio(getRatioFromEvent(ev)); };
    const onEnd = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);
  };

  const retry = () => {
    const v = videoRef.current;
    if (!v) return;
    setError(false);
    setLoading(true);
    v.load();
    v.play().catch(() => {});
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden select-none"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-controls]")) return;
        togglePlay();
        resetHideTimer();
      }}
    >
      {/* Video element — key on src so it remounts on change */}
      <video
        key={src}
        ref={videoRef}
        src={src}
        poster={poster}
        preload="auto"
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-contain"
        style={{ display: "block" }}
      />

      {/* Loading spinner */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Loader2 className="w-10 h-10 animate-spin text-white/80" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70 gap-3">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white/80 text-xs">Failed to load video</p>
          <button
            onClick={(e) => { e.stopPropagation(); retry(); }}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Paused big play button */}
      {!playing && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-7 h-7 ml-1 text-white" fill="white" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        data-controls
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seek bar */}
        <div className="px-3 pt-2">
          <div
            ref={seekBarRef}
            className="relative h-5 flex items-center cursor-pointer"
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
          >
            <div className="absolute w-full h-1 rounded-full bg-white/20">
              <div className="absolute left-0 top-0 h-full rounded-full bg-white/30" style={{ width: `${bufferedPct}%` }} />
              <div className="absolute left-0 top-0 h-full rounded-full bg-red-500" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md translate-x-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-2 px-3 pb-3 pt-0.5">
          <button
            className="text-white/90 hover:text-white p-1 transition-colors"
            onClick={togglePlay}
          >
            {playing
              ? <Pause className="w-5 h-5" fill="currentColor" />
              : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            }
          </button>

          <button
            className="text-white/70 hover:text-white p-1 transition-colors"
            onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } }}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <span className="text-white/60 text-[10px] tabular-nums">
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          {(title || artist) && (
            <span className="flex-1 truncate text-white/50 text-[10px] text-right hidden sm:block">
              {artist ? `${artist} — ` : ""}{title}
            </span>
          )}
          {!(title || artist) && <div className="flex-1" />}

          <button
            className="text-white/70 hover:text-white p-1 transition-colors"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicVideoPlayer;
