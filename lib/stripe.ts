import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const PLANS = {
  basic: {
    name: "Basic",
    price: 0,
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    features: [
      "AI-powered itinerary generation",
      "Hotel & flight search",
      "Wishlist & favorites",
      "Budget tracking",
      "PDF export",
      "Weather & city info",
      "RAG-powered recommendations",
    ],
    excluded: ["Group collaboration", "Shared itineraries", "Real-time chat", "Polls & voting"],
  },
  pro: {
    name: "Pro",
    price: 10,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "Everything in Basic",
      "Group collaboration",
      "Shared itineraries",
      "Real-time chat",
      "Polls & voting",
      "Invite collaborators",
      "Priority AI generation",
    ],
    excluded: [],
  },
} as const;

export type PlanType = keyof typeof PLANS;
