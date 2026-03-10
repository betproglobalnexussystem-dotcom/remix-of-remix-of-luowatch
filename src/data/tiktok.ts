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

export interface TikTokVideo {
  id: number;
  username: string;
  displayName: string;
  description: string;
  music: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  thumbnail: string;
  avatar: string;
  verified: boolean;
}

export const tiktokVideos: TikTokVideo[] = [
  { id: 1, username: "@acholi_dancer", displayName: "Acholi Dancer", description: "Traditional Acholi dance 🔥 #acholi #culture #dance #uganda", music: "♫ Acholi Traditional Beat - DJ Luo", likes: "45.2K", comments: "1,234", shares: "890", saves: "2.1K", thumbnail: poster1, avatar: poster2, verified: true },
  { id: 2, username: "@gulu_life", displayName: "Gulu Life", description: "Morning vibes in Gulu town 🌅 #gulu #northernuganda #acholi", music: "♫ original sound - Gulu Life", likes: "12.8K", comments: "456", shares: "234", saves: "678", thumbnail: poster3, avatar: poster4, verified: false },
  { id: 3, username: "@acholi_cook", displayName: "Acholi Kitchen", description: "How to make the best Malakwang 🍲 #acholifood #cooking #recipe", music: "♫ Cooking Time - Kitchen Beats", likes: "89.1K", comments: "3,456", shares: "5,678", saves: "12K", thumbnail: poster5, avatar: poster6, verified: true },
  { id: 4, username: "@luo_comedy", displayName: "Luo Comedy", description: "When mom catches you sneaking out 😂 #comedy #acholi #funny", music: "♫ Funny Moments - Comedy Central", likes: "234K", comments: "8,901", shares: "12.3K", saves: "5.6K", thumbnail: poster7, avatar: poster8, verified: true },
  { id: 5, username: "@acholi_music", displayName: "Acholi Beats", description: "New Acholi rap dropping soon 🎵 #music #acholirap #newmusic", music: "♫ unreleased - Acholi Beats", likes: "67.4K", comments: "2,345", shares: "1,234", saves: "8.9K", thumbnail: poster9, avatar: poster10, verified: false },
  { id: 6, username: "@pader_girl", displayName: "Pader Girl", description: "Village life hits different ❤️ #village #acholi #peaceful", music: "♫ Peaceful - Nature Sounds", likes: "156K", comments: "5,678", shares: "3,456", saves: "9.1K", thumbnail: poster2, avatar: poster1, verified: false },
  { id: 7, username: "@acholi_fashion", displayName: "Acholi Fashion", description: "Traditional meets modern 👗 #fashion #acholi #style", music: "♫ Runway - Fashion Beats", likes: "78.9K", comments: "1,890", shares: "2,345", saves: "4.5K", thumbnail: poster4, avatar: poster3, verified: true },
  { id: 8, username: "@kitgum_boy", displayName: "Kitgum Boy", description: "Football skills from the village ⚽ #football #skills #acholi", music: "♫ Stadium Anthem - Sport Mix", likes: "345K", comments: "12K", shares: "23.4K", saves: "15K", thumbnail: poster6, avatar: poster5, verified: false },
];
