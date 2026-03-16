import { useState, useEffect } from "react";
import { orderBy, where, limit, QueryConstraint } from "firebase/firestore";
import {
  FireMovie, FireMusic, FireTikTok, FireComment, FireChannel, FireActivity,
  subscribeMovies, subscribeMusic, subscribeTikTok, subscribeComments, subscribeActivities,
  getChannels, getMovieById, getMusicById, getEpisodes, getComments,
  FireEpisode,
} from "@/lib/firestore";
import { getAllMusic, getMusicFromCache, subscribeToMusicCache, isMusicCacheReady } from "@/lib/musicCache";

export function useMovies(constraints?: QueryConstraint[]) {
  const [movies, setMovies] = useState<FireMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeMovies(constraints || [orderBy("createdAt", "desc")], (data) => {
      setMovies(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { movies, loading };
}

export function useFeaturedMovies() {
  const [movies, setMovies] = useState<FireMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeMovies(
      [orderBy("createdAt", "desc")],
      (data) => {
        setMovies(data.filter(m => m.featured));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { movies, loading };
}

export function useVJMovies(vjId: string) {
  const [movies, setMovies] = useState<FireMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vjId) return;
    const unsub = subscribeMovies(
      [where("vjId", "==", vjId)],
      (data) => {
        const sorted = [...data].sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
        setMovies(sorted);
        setLoading(false);
      }
    );
    return unsub;
  }, [vjId]);

  return { movies, loading };
}

export function useMovie(id: string) {
  const [movie, setMovie] = useState<FireMovie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getMovieById(id).then(m => { setMovie(m); setLoading(false); });
  }, [id]);

  return { movie, loading };
}

export function useEpisodes(movieId: string) {
  const [episodes, setEpisodes] = useState<FireEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    getEpisodes(movieId).then(eps => { setEpisodes(eps); setLoading(false); });
  }, [movieId]);

  return { episodes, loading };
}

export function useMusicVideos(_constraints?: QueryConstraint[]) {
  // Read from global cache synchronously — if already loaded, no wait at all
  const [music, setMusic] = useState<FireMusic[]>(() => getAllMusic());
  const [loading, setLoading] = useState(() => !isMusicCacheReady());

  useEffect(() => {
    // Subscribe to live updates from the global singleton cache
    const unsub = subscribeToMusicCache((data) => {
      setMusic(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { music, loading };
}

export function useMusicianVideos(musicianId: string) {
  const [music, setMusic] = useState<FireMusic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!musicianId) return;
    const unsub = subscribeMusic(
      [where("musicianId", "==", musicianId)],
      (data) => {
        const sorted = [...data].sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
        setMusic(sorted);
        setLoading(false);
      }
    );
    return unsub;
  }, [musicianId]);

  return { music, loading };
}

export function useMusicById(id: string) {
  // Initialize synchronously from cache — zero delay if cache is warm
  const [music, setMusic] = useState<FireMusic | null>(() => (id ? getMusicFromCache(id) : null));
  const [loading, setLoading] = useState(() => !id || (!getMusicFromCache(id) && !isMusicCacheReady()));

  useEffect(() => {
    if (!id) return;

    // Check cache right now in case it arrived between render and effect
    const cached = getMusicFromCache(id);
    if (cached) { setMusic(cached); setLoading(false); return; }

    // Subscribe to cache updates — fires immediately when cache fills
    const unsub = subscribeToMusicCache((all) => {
      const found = all.find((m) => m.id === id);
      if (found) { setMusic(found); setLoading(false); }
    });

    // Also run a direct Firestore fetch in parallel as a safety net
    getMusicById(id).then((m) => {
      if (m) { setMusic(m); setLoading(false); }
    }).catch(() => {});

    return unsub;
  }, [id]);

  return { music, loading };
}

export function useTikTokVideos(constraints?: QueryConstraint[]) {
  const [videos, setVideos] = useState<FireTikTok[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeTikTok(constraints || [orderBy("createdAt", "desc")], (data) => {
      setVideos(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { videos, loading };
}

export function useTikTokerVideos(tiktokerId: string) {
  const [videos, setVideos] = useState<FireTikTok[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tiktokerId) return;
    const unsub = subscribeTikTok(
      [where("tiktokerId", "==", tiktokerId)],
      (data) => {
        const sorted = [...data].sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
        setVideos(sorted);
        setLoading(false);
      }
    );
    return unsub;
  }, [tiktokerId]);

  return { videos, loading };
}

export function useComments(contentId: string, contentType: string) {
  const [comments, setComments] = useState<FireComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId) return;
    const unsub = subscribeComments(contentId, contentType, (data) => {
      setComments(data);
      setLoading(false);
    });
    return unsub;
  }, [contentId, contentType]);

  return { comments, loading };
}

const HARDCODED_CHANNELS: FireChannel[] = [
  {
    id: "wan-luo-tv",
    name: "Wan LUO TV",
    logoUrl: "https://yt3.googleusercontent.com/IJwg98TL59Gi629XqJymiwbXOPsePkaHZlrcM3GoNxjW1lb0QZ57qdg6o33PW8_ZiJlP0aDtass=s900-c-k-c0x00ffffff-no-rj",
    streamUrl: "https://stream.hydeinnovations.com/luotv-flussonic/tracks-v1a1/mono.m3u8",
    isLive: true,
    description: "Wan LUO TV - Live Broadcasting",
    vjId: "",
    createdAt: null,
  },
  {
    id: "bukedde-tv-1",
    name: "Bukedde TV 1",
    logoUrl: "https://i.ytimg.com/vi/gTPqSM8NjSU/maxresdefault.jpg",
    streamUrl: "https://stream.hydeinnovations.com/bukedde1flussonic/tracks-v1a1/index.m3u8",
    isLive: true,
    description: "Bukedde TV 1 - Live Broadcasting",
    vjId: "",
    createdAt: null,
  },
];

export function useChannels() {
  const [channels, setChannels] = useState<FireChannel[]>(HARDCODED_CHANNELS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChannels().then(chs => {
      setChannels([...HARDCODED_CHANNELS, ...chs]);
      setLoading(false);
    });
  }, []);

  return { channels, loading };
}

export function useActivities() {
  const [activities, setActivities] = useState<FireActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeActivities((data) => {
      setActivities(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { activities, loading };
}
