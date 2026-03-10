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

export interface MovieDetail {
  id: number;
  title: string;
  year: string;
  rating: number;
  ratingCount: number;
  duration: string;
  ageRating: string;
  genres: string[];
  description: string;
  image: string;
  type: "movie" | "series";
  totalEpisodes?: number;
  cast: { name: string; role: string; image: string }[];
}

export const movieDetails: Record<number, MovieDetail> = {
  1: {
    id: 1, title: "Shadow Realm", year: "2025", rating: 6.7, ratingCount: 30, duration: "1h 35m", ageRating: "13+",
    genres: ["Action", "Mystery", "Crime", "Revenge", "Mandarin"], type: "movie",
    description: "In Southeast Asia in the 1960s, the gang led by armed robber Tao Li is trapped in Dice City after a robbery. Detective Kumar and Chinese police officer Wong Zhan join hands, dismantling their elaborate schemes. When Li's defense is crushed, he gives up his escape and commits...",
    image: poster1,
    cast: [
      { name: "Li Li Ming", role: "Director", image: poster1 },
      { name: "Shi Yanueng", role: "Cast", image: poster2 },
      { name: "Zhang Hao Ran", role: "Cast", image: poster3 },
      { name: "Yako", role: "Cast", image: poster4 },
    ],
  },
  2: {
    id: 2, title: "Enchanted Forest", year: "2024", rating: 7.2, ratingCount: 24, duration: "2h 10m", ageRating: "PG",
    genres: ["Fantasy", "Adventure", "Romance"], type: "series", totalEpisodes: 34,
    description: "Influenced by her mother from a young age, Yi Lan studied the cute and displayed remarkable talent. In her very first week of High school, encouraged by her childhood friend Tong Xiao, she resolved to form her own martial list. Driven by the goals of 'defending the school order'...",
    image: poster2,
    cast: [
      { name: "Lin Chuhan", role: "Director", image: poster5 },
      { name: "Kasper", role: "Cast", image: poster6 },
      { name: "Zhang Xinyi", role: "Cast", image: poster7 },
    ],
  },
  3: { id: 3, title: "The Haunting", year: "2025", rating: 5.9, ratingCount: 18, duration: "1h 48m", ageRating: "16+", genres: ["Horror", "Thriller", "Mystery"], type: "movie", description: "A family moves into an old mansion only to discover its terrifying past. As supernatural events escalate, they must uncover the truth before it's too late.", image: poster3, cast: [{ name: "Sarah West", role: "Director", image: poster8 }, { name: "Tom Ridge", role: "Cast", image: poster9 }] },
  4: { id: 4, title: "Paris Nights", year: "2024", rating: 8.1, ratingCount: 45, duration: "1h 55m", ageRating: "13+", genres: ["Romance", "Drama", "Comedy"], type: "movie", description: "Two strangers meet on a bridge in Paris and spend one unforgettable night exploring the city, discovering that love can bloom in the most unexpected moments.", image: poster4, cast: [{ name: "Marie Laurent", role: "Director", image: poster10 }, { name: "Jack Devon", role: "Cast", image: poster12 }] },
  5: { id: 5, title: "Orbital Strike", year: "2025", rating: 7.8, ratingCount: 38, duration: "2h 05m", ageRating: "13+", genres: ["Sci-Fi", "Action", "Thriller"], type: "movie", description: "When an asteroid threatens Earth, a team of elite astronauts must execute a daring mission in deep space to save humanity from extinction.", image: poster5, cast: [{ name: "Rex Cole", role: "Director", image: poster1 }, { name: "Nina Starr", role: "Cast", image: poster2 }] },
};

// Generate details for all movie IDs that don't have specific details
export function getMovieDetail(id: number): MovieDetail {
  if (movieDetails[id]) return movieDetails[id];
  // Fallback detail
  const images = [poster1, poster2, poster3, poster4, poster5, poster6, poster7, poster8, poster9, poster10, poster12];
  return {
    id,
    title: `Movie ${id}`,
    year: "2024",
    rating: 6.0 + Math.random() * 3,
    ratingCount: Math.floor(10 + Math.random() * 50),
    duration: "1h 40m",
    ageRating: "13+",
    genres: ["Action", "Drama"],
    type: id % 3 === 0 ? "series" : "movie",
    totalEpisodes: id % 3 === 0 ? 24 : undefined,
    description: "An exciting story that unfolds across multiple dramatic scenes, keeping viewers on the edge of their seats throughout.",
    image: images[id % images.length],
    cast: [
      { name: "Director A", role: "Director", image: images[(id + 1) % images.length] },
      { name: "Actor B", role: "Cast", image: images[(id + 2) % images.length] },
      { name: "Actor C", role: "Cast", image: images[(id + 3) % images.length] },
    ],
  };
}

export const topMovies = [
  { rank: 1, title: "Submission", image: poster1 },
  { rank: 2, title: "SNAKE", image: poster9 },
  { rank: 3, title: "Detective Dee: Buddha's Wrath", image: poster3 },
  { rank: 4, title: "Monkey King fights Lion Camel", image: poster7 },
  { rank: 5, title: "Shadow Realm", image: poster5 },
  { rank: 6, title: "Code: Guardian", image: poster10 },
  { rank: 7, title: "BLADE OF FURY", image: poster4 },
  { rank: 8, title: "The Hidden Fox", image: poster8 },
  { rank: 9, title: "Evanciel", image: poster12 },
  { rank: 10, title: "Secret Love", image: poster6 },
];

export const topDramas = [
  { rank: 1, title: "Pursuit of Jade", image: poster2 },
  { rank: 2, title: "Duong with You (UNCUT)", image: null },
  { rank: 3, title: "How Dare You?", image: null },
  { rank: 4, title: "The Earth 4 Elements", image: null },
  { rank: 5, title: "Our Dazzling Days", image: null },
  { rank: 6, title: "SPEED AND LOVE", image: null },
  { rank: 7, title: "The Best Thing", image: null },
  { rank: 8, title: "Fated Hearts", image: null },
  { rank: 9, title: "Peach Lover", image: null },
  { rank: 10, title: "Story of Kunning Palace", image: null },
];

export const sampleComments = [
  { user: "UserTred22821", avatar: null, time: "5 days", text: "nice movie", likes: 0 },
  { user: "UserRod5E7WC", avatar: null, time: "8 days", text: "Great movie!", likes: 0 },
  { user: "UserT924e7QK", avatar: null, time: "6 days", text: "I don't think Yu Bin Bin was the correct Partner for Zhang Xi Yi. he/s too old. In the other hand she/s very likely and/ive Anuay play her roll very well.", likes: 0 },
  { user: "MachBujewsin", avatar: null, time: "4 days", text: "its a classic karmafiloya mimaaya", likes: 2 },
  { user: "flita.bulyeko145", avatar: null, time: "4 days", text: "alice drama dia kalalu", likes: 0 },
];
