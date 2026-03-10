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

export interface TVChannel {
  id: number;
  name: string;
  logo: string;
  isLive: boolean;
  color: string;
}

export const tvChannels: TVChannel[] = [
  { id: 1, name: "BBS TV", logo: poster1, isLive: true, color: "from-blue-900 to-blue-700" },
  { id: 2, name: "Spark TV", logo: poster2, isLive: true, color: "from-indigo-900 to-indigo-700" },
  { id: 3, name: "FUFA TV", logo: poster3, isLive: true, color: "from-green-900 to-green-700" },
  { id: 4, name: "NTV", logo: poster4, isLive: true, color: "from-blue-800 to-blue-600" },
  { id: 5, name: "Galaxy TV", logo: poster5, isLive: false, color: "from-purple-900 to-purple-700" },
  { id: 6, name: "Russia Today", logo: poster6, isLive: true, color: "from-green-800 to-green-600" },
  { id: 7, name: "Salt TV", logo: poster7, isLive: true, color: "from-pink-900 to-pink-700" },
  { id: 8, name: "AFRO Beat TV", logo: poster8, isLive: true, color: "from-yellow-900 to-yellow-700" },
  { id: 9, name: "K24", logo: poster9, isLive: false, color: "from-orange-900 to-orange-700" },
  { id: 10, name: "Kids Channel", logo: poster10, isLive: true, color: "from-cyan-900 to-cyan-700" },
  { id: 11, name: "KS TV", logo: poster12, isLive: true, color: "from-red-900 to-red-700" },
  { id: 12, name: "LUO TV", logo: poster1, isLive: false, color: "from-amber-900 to-amber-700" },
  { id: 13, name: "Dream TV", logo: poster2, isLive: true, color: "from-slate-800 to-slate-600" },
  { id: 14, name: "Spirit TV", logo: poster3, isLive: true, color: "from-violet-900 to-violet-700" },
  { id: 15, name: "Ark TV", logo: poster4, isLive: true, color: "from-teal-900 to-teal-700" },
  { id: 16, name: "Gugugde TV", logo: poster5, isLive: true, color: "from-fuchsia-900 to-fuchsia-700" },
  { id: 17, name: "FORT TV", logo: poster6, isLive: false, color: "from-lime-900 to-lime-700" },
  { id: 18, name: "Romanza Africa", logo: poster7, isLive: true, color: "from-pink-800 to-pink-600" },
  { id: 19, name: "CGTN", logo: poster8, isLive: true, color: "from-yellow-800 to-yellow-600" },
  { id: 20, name: "Al Jazeera", logo: poster9, isLive: true, color: "from-orange-800 to-orange-600" },
  { id: 21, name: "TV West", logo: poster10, isLive: false, color: "from-green-900 to-green-700" },
  { id: 22, name: "Bukedde TV", logo: poster12, isLive: true, color: "from-amber-800 to-amber-600" },
  { id: 23, name: "Bukedde 1", logo: poster1, isLive: true, color: "from-blue-900 to-blue-700" },
  { id: 24, name: "Trace Urban", logo: poster2, isLive: true, color: "from-rose-900 to-rose-700" },
  { id: 25, name: "NRG Radio", logo: poster3, isLive: false, color: "from-red-800 to-red-600" },
  { id: 26, name: "Kartoon Channel", logo: poster4, isLive: true, color: "from-purple-800 to-purple-600" },
];
