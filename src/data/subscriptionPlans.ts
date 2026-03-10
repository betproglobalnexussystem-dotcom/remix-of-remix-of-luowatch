export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: number; // in days
  price: number; // in UGX
  priceFormatted: string;
  description: string;
  type: "content" | "games";
}

export const contentPlans: SubscriptionPlan[] = [
  { id: "1day", name: "1 Day", duration: 1, price: 3500, priceFormatted: "UGX 3,500", description: "24 hours access to Movies, Music & Live TV", type: "content" },
  { id: "1week", name: "1 Week", duration: 7, price: 12000, priceFormatted: "UGX 12,000", description: "7 days access to Movies, Music & Live TV", type: "content" },
  { id: "1month", name: "1 Month", duration: 30, price: 45000, priceFormatted: "UGX 45,000", description: "30 days access to Movies, Music & Live TV", type: "content" },
  { id: "3months", name: "3 Months", duration: 90, price: 100000, priceFormatted: "UGX 100,000", description: "90 days access — Best Value!", type: "content" },
];

export const gamesPlan: SubscriptionPlan = {
  id: "games-1day", name: "Games - 1 Day", duration: 1, price: 1000, priceFormatted: "UGX 1,000", description: "24 hours access to all Games", type: "games",
};
