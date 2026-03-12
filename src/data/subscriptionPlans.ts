export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: number; // in days
  price: number; // in UGX
  priceFormatted: string;
  description: string;
  type: "content" | "games";
  downloadLimit: number; // max downloads allowed, -1 = unlimited
}

export const contentPlans: SubscriptionPlan[] = [
  { id: "1day", name: "1 Day", duration: 1, price: 3500, priceFormatted: "UGX 3,500", description: "24 hours access — 10 downloads", type: "content", downloadLimit: 10 },
  { id: "1week", name: "1 Week", duration: 7, price: 12000, priceFormatted: "UGX 12,000", description: "7 days access — 30 downloads", type: "content", downloadLimit: 30 },
  { id: "1month", name: "1 Month", duration: 30, price: 45000, priceFormatted: "UGX 45,000", description: "30 days access — 100 downloads", type: "content", downloadLimit: 100 },
  { id: "3months", name: "3 Months", duration: 90, price: 100000, priceFormatted: "UGX 100,000", description: "90 days access — 200 downloads", type: "content", downloadLimit: 200 },
  { id: "1year", name: "1 Year", duration: 365, price: 600000, priceFormatted: "UGX 600,000", description: "365 days — Unlimited downloads", type: "content", downloadLimit: -1 },
];

export const gamesPlan: SubscriptionPlan = {
  id: "games-1day", name: "Games - 1 Day", duration: 1, price: 1000, priceFormatted: "UGX 1,000", description: "24 hours access to all Games", type: "games", downloadLimit: -1,
};
