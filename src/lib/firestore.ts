import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, limit, increment, serverTimestamp,
  onSnapshot, Timestamp, QueryConstraint, setDoc
} from "firebase/firestore";
import { db } from "./firebase";

// ============ TYPES ============

export interface FireMovie {
  id: string;
  title: string;
  year: string;
  quality: string;
  genre: string;
  description: string;
  posterUrl: string;
  movieUrl: string;
  downloadUrl: string;
  views: number;
  downloads: number;
  featured: boolean;
  type: "movie" | "series";
  vjId: string;
  vjName: string;
  createdAt: Timestamp | null;
}

export interface FireEpisode {
  id: string;
  movieId: string;
  seriesTitle: string;
  season: string;
  episode: string;
  episodeTitle: string;
  episodeUrl: string;
  vjId: string;
  createdAt: Timestamp | null;
}

export interface FireMusic {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  plays: number;
  downloads: number;
  musicianId: string;
  musicianName: string;
  verified: boolean;
  createdAt: Timestamp | null;
}

export interface FireTikTok {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  music: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  tiktokerId: string;
  tiktokerName: string;
  tiktokerAvatar: string;
  verified: boolean;
  createdAt: Timestamp | null;
}

export interface FireChannel {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string;
  isLive: boolean;
  description: string;
  vjId: string;
  createdAt: Timestamp | null;
}

export interface FireComment {
  id: string;
  contentId: string;
  contentType: "movie" | "music" | "tiktok" | "channel";
  userId: string;
  userName: string;
  text: string;
  likes: number;
  createdAt: Timestamp | null;
}

export interface FireProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  email: string;
}

// ============ PROFILES ============

export async function saveProfileToFirestore(uid: string, data: Omit<FireProfile, "id">) {
  const ref = doc(db, "profiles", uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...data });
    } else {
      await setDoc(ref, { ...data, createdAt: serverTimestamp() });
    }
  } catch (err) {
    // Retry once with setDoc on any error
    console.error("saveProfile first attempt failed, retrying:", err);
    await setDoc(doc(db, "profiles", uid), { ...data, createdAt: serverTimestamp() });
  }
}

export async function getProfile(uid: string): Promise<FireProfile | null> {
  const snap = await getDoc(doc(db, "profiles", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FireProfile;
}

// ============ MOVIES ============

export async function addMovie(data: Omit<FireMovie, "id" | "views" | "downloads" | "createdAt">) {
  return addDoc(collection(db, "movies"), {
    ...data, views: 0, downloads: 0, createdAt: serverTimestamp(),
  });
}

export async function getMovies(constraints: QueryConstraint[] = []) {
  const q = query(collection(db, "movies"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireMovie));
}

export async function getMovieById(id: string): Promise<FireMovie | null> {
  const snap = await getDoc(doc(db, "movies", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FireMovie;
}

export async function updateMovie(id: string, data: Partial<FireMovie>) {
  return updateDoc(doc(db, "movies", id), data);
}

export async function deleteMovie(id: string) {
  return deleteDoc(doc(db, "movies", id));
}

export function subscribeMovies(constraints: QueryConstraint[], callback: (movies: FireMovie[]) => void) {
  const q = query(collection(db, "movies"), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FireMovie)));
  });
}

export async function incrementMovieViews(id: string) {
  return updateDoc(doc(db, "movies", id), { views: increment(1) });
}

export async function incrementMovieDownloads(id: string) {
  return updateDoc(doc(db, "movies", id), { downloads: increment(1) });
}

// ============ EPISODES ============

export async function addEpisode(data: Omit<FireEpisode, "id" | "createdAt">) {
  return addDoc(collection(db, "episodes"), { ...data, createdAt: serverTimestamp() });
}

export async function getEpisodes(movieId: string) {
  const q = query(collection(db, "episodes"), where("movieId", "==", movieId), orderBy("season"), orderBy("episode"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireEpisode));
}

export async function getEpisodesByVJ(vjId: string) {
  const q = query(collection(db, "episodes"), where("vjId", "==", vjId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireEpisode));
}

export async function updateEpisode(id: string, data: Partial<FireEpisode>) {
  return updateDoc(doc(db, "episodes", id), data);
}

export async function deleteEpisode(id: string) {
  return deleteDoc(doc(db, "episodes", id));
}

// ============ MUSIC ============

export async function addMusicVideo(data: Omit<FireMusic, "id" | "plays" | "downloads" | "createdAt">) {
  return addDoc(collection(db, "music"), { ...data, plays: 0, downloads: 0, createdAt: serverTimestamp() });
}

export async function getMusicVideos(constraints: QueryConstraint[] = []) {
  const q = query(collection(db, "music"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireMusic));
}

export async function getMusicById(id: string): Promise<FireMusic | null> {
  const snap = await getDoc(doc(db, "music", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FireMusic;
}

export async function updateMusicVideo(id: string, data: Partial<FireMusic>) {
  return updateDoc(doc(db, "music", id), data);
}

export async function deleteMusicVideo(id: string) {
  return deleteDoc(doc(db, "music", id));
}

export function subscribeMusic(constraints: QueryConstraint[], callback: (music: FireMusic[]) => void) {
  const q = query(collection(db, "music"), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FireMusic)));
  });
}

export async function incrementMusicPlays(id: string) {
  return updateDoc(doc(db, "music", id), { plays: increment(1) });
}

// ============ TIKTOK ============

export async function addTikTokVideo(data: Omit<FireTikTok, "id" | "likes" | "comments" | "shares" | "saves" | "views" | "createdAt">) {
  return addDoc(collection(db, "tiktok"), { ...data, likes: 0, comments: 0, shares: 0, saves: 0, views: 0, createdAt: serverTimestamp() });
}

export async function getTikTokVideos(constraints: QueryConstraint[] = []) {
  const q = query(collection(db, "tiktok"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireTikTok));
}

export async function deleteTikTokVideo(id: string) {
  return deleteDoc(doc(db, "tiktok", id));
}

export function subscribeTikTok(constraints: QueryConstraint[], callback: (vids: FireTikTok[]) => void) {
  const q = query(collection(db, "tiktok"), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FireTikTok)));
  });
}

export async function incrementTikTokField(id: string, field: "likes" | "shares" | "saves" | "views") {
  return updateDoc(doc(db, "tiktok", id), { [field]: increment(1) });
}

// ============ CHANNELS ============

export async function addChannel(data: Omit<FireChannel, "id" | "createdAt">) {
  return addDoc(collection(db, "channels"), { ...data, createdAt: serverTimestamp() });
}

export async function getChannels() {
  const q = query(collection(db, "channels"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireChannel));
}

export async function getChannelById(id: string): Promise<FireChannel | null> {
  const snap = await getDoc(doc(db, "channels", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FireChannel;
}

// ============ COMMENTS ============

export async function addComment(data: Omit<FireComment, "id" | "likes" | "createdAt">) {
  return addDoc(collection(db, "comments"), { ...data, likes: 0, createdAt: serverTimestamp() });
}

export async function getComments(contentId: string, contentType: string) {
  const q = query(
    collection(db, "comments"),
    where("contentId", "==", contentId),
    where("contentType", "==", contentType),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireComment));
}

export function subscribeComments(contentId: string, contentType: string, callback: (comments: FireComment[]) => void) {
  const q = query(
    collection(db, "comments"),
    where("contentId", "==", contentId),
    where("contentType", "==", contentType),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FireComment)));
  });
}

export async function likeComment(id: string) {
  return updateDoc(doc(db, "comments", id), { likes: increment(1) });
}

// ============ ACTIVITY LOG ============

export interface FireActivity {
  id: string;
  type: "view" | "download" | "share" | "comment" | "like" | "save";
  contentType: "movie" | "music" | "tiktok" | "channel";
  contentId: string;
  contentTitle: string;
  userId: string;
  userName: string;
  createdAt: Timestamp | null;
}

export async function logActivity(data: Omit<FireActivity, "id" | "createdAt">) {
  return addDoc(collection(db, "activities"), { ...data, createdAt: serverTimestamp() });
}

export function subscribeActivities(callback: (activities: FireActivity[]) => void) {
  const q = query(collection(db, "activities"), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FireActivity)));
  });
}

// ============ SEARCH ============

export async function searchContent(searchTerm: string) {
  const term = searchTerm.toLowerCase();
  
  // Search movies
  const moviesSnap = await getDocs(collection(db, "movies"));
  const movies = moviesSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as FireMovie))
    .filter(m => m.title.toLowerCase().includes(term) || m.genre.toLowerCase().includes(term) || m.vjName.toLowerCase().includes(term));

  // Search music
  const musicSnap = await getDocs(collection(db, "music"));
  const music = musicSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as FireMusic))
    .filter(m => m.title.toLowerCase().includes(term) || m.artist.toLowerCase().includes(term));

  // Search tiktok
  const tiktokSnap = await getDocs(collection(db, "tiktok"));
  const tiktok = tiktokSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as FireTikTok))
    .filter(t => t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term));

  return { movies, music, tiktok };
}
