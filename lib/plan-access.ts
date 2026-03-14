import { prisma } from "@/lib/db";

type Feature = "collaboration" | "invitations" | "chat" | "polls" | "shared_itinerary";

const PRO_ONLY_FEATURES: Feature[] = [
  "collaboration",
  "invitations",
  "chat",
  "polls",
  "shared_itinerary",
];

export async function getUserPlan(userId: string): Promise<"basic" | "pro"> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  return (user?.plan as "basic" | "pro") || "basic";
}

export function canAccessFeature(plan: string, feature: Feature): boolean {
  if (plan === "pro") return true;
  return !PRO_ONLY_FEATURES.includes(feature);
}

export async function checkFeatureAccess(userId: string, feature: Feature): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return canAccessFeature(plan, feature);
}
