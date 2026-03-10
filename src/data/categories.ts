export interface Category {
  name: string;
  subcategories?: string[];
}

export const categories: Category[] = [
  { name: "Action", subcategories: ["Superhero", "Heist", "Martial Arts", "Spy / Espionage", "Disaster", "War Action", "Action Comedy"] },
  { name: "Adventure", subcategories: ["Quest", "Swashbuckler", "Treasure Hunt", "Survival", "Sea Adventure"] },
  { name: "Comedy", subcategories: ["Slapstick", "Satire", "Dark / Black Comedy", "Parody / Spoof", "Romantic Comedy (Rom-com)", "Mockumentary", "Screwball", "Sitcom"] },
  { name: "Drama", subcategories: ["Biographical (Biopic)", "Historical Drama", "Coming-of-Age", "Legal / Courtroom", "Medical Drama", "Melodrama", "Teen Drama"] },
  { name: "Horror", subcategories: ["Slasher", "Psychological Horror", "Supernatural", "Gothic", "Body Horror", "Found Footage", "Zombie", "Folk Horror"] },
  { name: "Science Fiction (Sci-Fi)", subcategories: ["Cyberpunk", "Dystopian", "Space Opera", "Time Travel", "Post-Apocalyptic", "Alien Invasion", "Steampunk"] },
  { name: "Fantasy", subcategories: ["High / Epic Fantasy", "Urban Fantasy", "Dark Fantasy", "Sword and Sorcery", "Fairy Tale", "Magical Realism"] },
  { name: "Thriller & Mystery", subcategories: ["Psychological Thriller", "Crime Thriller", "Political Thriller", "Espionage / Conspiracy", "Techno-Thriller", "Whodunit"] },
  { name: "Western" },
  { name: "Romance" },
  { name: "Documentary" },
  { name: "Musical" },
  { name: "Crime" },
  { name: "Animation" },
  { name: "Sports" },
  { name: "Nigeria" },
  { name: "Highschool" },
];

export const genreList = categories.map(c => c.name);
