import poster1 from "@/assets/poster1.jpg";
import poster2 from "@/assets/poster2.jpg";
import poster3 from "@/assets/poster3.jpg";
import poster4 from "@/assets/poster4.jpg";
import poster5 from "@/assets/poster5.jpg";
import poster6 from "@/assets/poster6.jpg";
import poster7 from "@/assets/poster7.jpg";
import poster8 from "@/assets/poster8.jpg";
import poster9 from "@/assets/poster9.jpg";
import poster10 from "@/assets/poster10.jpg";
import poster12 from "@/assets/poster12.jpg";
import banner1 from "@/assets/banner1.jpg";
import banner2 from "@/assets/banner2.jpg";

export interface Movie {
  id: number;
  title: string;
  year: string;
  badge: "dual-audio" | "hindi-dub" | "featured" | "web-dl" | "hdcam";
  quality: string;
  image: string;
  date: string;
  rating?: number;
}

export const featuredMovies: Movie[] = [
  { id: 1, title: "Shadow Realm", year: "2025", badge: "featured", quality: "1080p", image: poster1, date: "Mar 01, 2025", rating: 6.7 },
  { id: 2, title: "Enchanted Forest", year: "2024", badge: "featured", quality: "720p", image: poster2, date: "Feb 15, 2025", rating: 7.2 },
  { id: 3, title: "The Haunting", year: "2025", badge: "featured", quality: "1080p", image: poster3, date: "Jan 28, 2025", rating: 5.9 },
  { id: 4, title: "Paris Nights", year: "2024", badge: "featured", quality: "BluRay", image: poster4, date: "Dec 20, 2024", rating: 8.1 },
  { id: 5, title: "Orbital Strike", year: "2025", badge: "featured", quality: "HDRip", image: poster5, date: "Mar 05, 2025", rating: 7.8 },
];

export const latestMovies: Movie[] = [
  { id: 6, title: "The Comeback", year: "2025", badge: "dual-audio", quality: "1080p", image: poster1, date: "Jan 25, 2025" },
  { id: 7, title: "Mission Chaos", year: "2024", badge: "hindi-dub", quality: "720p", image: poster9, date: "Nov 12, 2024" },
  { id: 8, title: "Night Archer", year: "2024", badge: "dual-audio", quality: "BluRay", image: poster8, date: "Sep 08, 2024" },
  { id: 9, title: "Warrior Report", year: "2025", badge: "dual-audio", quality: "HDRip", image: poster10, date: "Aug 22, 2025" },
  { id: 10, title: "Jungle Tales", year: "2024", badge: "hindi-dub", quality: "1080p", image: poster7, date: "Sep 04, 2024" },
  { id: 11, title: "Battlefield Glory", year: "2025", badge: "dual-audio", quality: "720p", image: poster6, date: "Jul 14, 2025" },
  { id: 12, title: "Neon Nights", year: "2024", badge: "dual-audio", quality: "BluRay", image: poster9, date: "Jun 30, 2024" },
  { id: 13, title: "Dark Mystery", year: "2025", badge: "hindi-dub", quality: "1080p", image: poster12, date: "May 18, 2025" },
  { id: 14, title: "Ancient Fury", year: "2024", badge: "dual-audio", quality: "HDRip", image: poster10, date: "Apr 12, 2024" },
  { id: 15, title: "Rex Rampage", year: "2025", badge: "dual-audio", quality: "1080p", image: poster7, date: "Mar 01, 2025" },
  { id: 16, title: "Cyber Dawn", year: "2024", badge: "hindi-dub", quality: "720p", image: poster5, date: "Feb 22, 2024" },
  { id: 17, title: "Hero Rising", year: "2025", badge: "dual-audio", quality: "BluRay", image: poster8, date: "Jan 15, 2025" },
  { id: 18, title: "Cold Storage", year: "2025", badge: "hindi-dub", quality: "1080p", image: poster3, date: "Jan 09, 2025" },
  { id: 19, title: "Love in Paris", year: "2024", badge: "dual-audio", quality: "HDRip", image: poster4, date: "Jan 06, 2025" },
  { id: 20, title: "Shadow Legacy", year: "2025", badge: "dual-audio", quality: "1080p", image: poster1, date: "Aug 09, 2024" },
  { id: 21, title: "Night Watch", year: "2024", badge: "hindi-dub", quality: "720p", image: poster12, date: "May 09, 2025" },
  { id: 22, title: "War Machine", year: "2025", badge: "dual-audio", quality: "BluRay", image: poster6, date: "Mar 02, 2025" },
  { id: 23, title: "Dark Defender", year: "2024", badge: "dual-audio", quality: "1080p", image: poster9, date: "Feb 14, 2024" },
  { id: 24, title: "The Stranger", year: "2025", badge: "hindi-dub", quality: "HDRip", image: poster3, date: "Jan 20, 2025" },
  { id: 25, title: "Final Verdict", year: "2024", badge: "dual-audio", quality: "1080p", image: poster12, date: "Dec 10, 2024" },
  { id: 26, title: "Monster Island", year: "2025", badge: "dual-audio", quality: "720p", image: poster7, date: "Nov 05, 2024" },
  { id: 27, title: "Titan Clash", year: "2024", badge: "hindi-dub", quality: "BluRay", image: poster10, date: "Oct 22, 2024" },
  { id: 28, title: "Lost Signal", year: "2025", badge: "dual-audio", quality: "1080p", image: poster5, date: "Feb 01, 2025" },
  { id: 29, title: "Night Scream", year: "2024", badge: "dual-audio", quality: "HDRip", image: poster3, date: "Sep 15, 2024" },
  { id: 30, title: "Space Frontier", year: "2025", badge: "hindi-dub", quality: "1080p", image: poster5, date: "Aug 30, 2024" },
];

export const bannerMovies = [
  { id: 101, title: "Shadow Operations", subtitle: "Dual Audio [Hindi-Eng]", year: "2025", image: banner1, quality: "1080p" },
  { id: 102, title: "Night Detective", subtitle: "Dual Audio [Hindi OR Russian]", year: "2024", image: banner2, quality: "720p" },
];

export const categories = [
  "Oscar Winning Movies",
  "IMDB Top 250 Movies",
  "Anime",
  "DC, Marvel or Superhero Movies & TV Series",
  "All ULTRA HD (4K) Movies",
  "All 1080p/Full HD Movies",
  "Sports Related Movies",
  "Animation & Cartoon Movies",
  "Bollywood/Hindi Movies",
  "English (Hollywood)",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Korean",
  "Japanese & Chinese",
  "Turkish",
  "Spanish",
  "Dual Audio",
  "Hindi Dubbed",
  "HDRC Collection",
  "TV & Web Series",
  "Featured Movies",
  "TV Shows",
  "Foreign Movies OR Other Industry (Mixed)",
];

export const latestUpdates = [
  { title: "The Comeback (2025) Dual Audio...", date: "Jan 25, 2025" },
  { title: "Mission Chaos (2024) Hindi PBR...", date: "Nov 12, 2024" },
  { title: "Night Archer (2024) Dual Audio (H...", date: "Sep 08, 2024" },
  { title: "Warrior Report (2025) Dual Audio...", date: "Aug 22, 2025" },
  { title: "Jungle Tales Biography - SayRay...", date: "Sep 04, 2024" },
];
