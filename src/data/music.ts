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

export interface MusicVideo {
  id: number;
  title: string;
  channel: string;
  channelVerified: boolean;
  views: string;
  timeAgo: string;
  duration: string;
  thumbnail: string;
  isLive?: boolean;
  isSponsored?: boolean;
}

export const musicVideos: MusicVideo[] = [
  { id: 1, title: "KAGAME ON U.S SANCTIONS: Rwandan President says they will defend themselves", channel: "NTVUganda", channelVerified: true, views: "5.3K", timeAgo: "3 hours ago", duration: "4:27", thumbnail: poster1 },
  { id: 2, title: "Survive 30 Days Stranded With Your Ex, Win $150,000", channel: "MrBeast", channelVerified: true, views: "7.9M", timeAgo: "5 hours ago", duration: "21:08", thumbnail: poster2 },
  { id: 3, title: "AFROBEAT MIX 2026 - The Best and Latest Afrobeat Jams to Welcome 2026!", channel: "DJ Afrobeat Mix", channelVerified: false, views: "276K", timeAgo: "2 months ago", duration: "1:02:15", thumbnail: poster3 },
  { id: 4, title: "It took me soo long to get up here and I jumped", channel: "Rdameron", channelVerified: false, views: "40", timeAgo: "4 days ago", duration: "0:18", thumbnail: poster4 },
  { id: 5, title: "Improved Schedule Reliability - Container Shipping Updates", channel: "FreightLogistics", channelVerified: true, views: "12K", timeAgo: "1 day ago", duration: "8:45", thumbnail: poster5, isSponsored: true },
  { id: 6, title: "Wrexham AFC v Chelsea | Key Moments | Fifth Round | Emirates FA Cup", channel: "The Emirates FA Cup", channelVerified: true, views: "276K", timeAgo: "1 hour ago", duration: "2:08", thumbnail: poster6 },
  { id: 7, title: "DUNYA WAGULU OTEGA WANG, DOLYA ATABAKE NATALABE FILM ENO", channel: "Zeng Movies TV", channelVerified: false, views: "1.1K", timeAgo: "5 days ago", duration: "10:27", thumbnail: poster7 },
  { id: 8, title: "I Flew To UGANDA For Their Biggest Car Show And This Happened!", channel: "Supercarblondie", channelVerified: true, views: "149K", timeAgo: "2 months ago", duration: "15:33", thumbnail: poster8 },
  { id: 9, title: "US and Israel Attack Iran - LIVE Breaking News Coverage & War Updates", channel: "AgendaFree TV", channelVerified: false, views: "30K", timeAgo: "watching", duration: "LIVE", thumbnail: poster9, isLive: true },
  { id: 10, title: "The War in Pictures: What Does It Look Like on Day 7? | Vantage with Palki", channel: "NTBG", channelVerified: false, views: "649K", timeAgo: "20 hours ago", duration: "12:45", thumbnail: poster10 },
  { id: 11, title: "Umukijaasa best compilation 2026 🎉 #animation #animecosines", channel: "Funimation01", channelVerified: false, views: "8.9K", timeAgo: "3 days ago", duration: "6:30", thumbnail: poster12 },
  { id: 12, title: "Kilo works everywhere you do.", channel: "Kilo Code", channelVerified: false, views: "", timeAgo: "", duration: "Ad", thumbnail: poster1, isSponsored: true },
  { id: 13, title: "Arsenal vs Mansfield 2-1 Goals & Highlights 2026", channel: "Soccerama", channelVerified: true, views: "35K", timeAgo: "6 hours ago", duration: "8:12", thumbnail: poster2 },
  { id: 14, title: "Ever Night Season 2 Episode 36 | Vj Ice P", channel: "PRIME DARK STUDIO 2", channelVerified: false, views: "15K", timeAgo: "4 months ago", duration: "28:00", thumbnail: poster3 },
  { id: 15, title: "Why Every U.S. President Sounds Weird", channel: "Trevor Noah", channelVerified: true, views: "511K", timeAgo: "3 days ago", duration: "14:20", thumbnail: poster4 },
  { id: 16, title: "Ugandan Love Band Non stop Mix 2023 | Top trending Ugandan Hits", channel: "Dj Tonny Omubanda", channelVerified: false, views: "627K", timeAgo: "3 years ago", duration: "1:15:00", thumbnail: poster5 },
];

export const musicCategories = [
  "All", "Music", "Afrobeat", "Hip Hop", "Gospel", "Live", "News",
  "Sports", "Gaming", "Comedy", "Trending", "Recently uploaded",
];
