import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(new URL("/choose-plan", request.url));
    }

    // Retrieve the Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      console.error("Checkout session not paid:", checkoutSession.payment_status);
      return NextResponse.redirect(new URL("/choose-plan?error=payment_failed", request.url));
    }

    const userId = checkoutSession.metadata?.userId;
    const plan = (checkoutSession.metadata?.plan as "basic" | "pro") || "pro";

    if (!userId) {
      console.error("Missing userId in checkout session metadata");
      return NextResponse.redirect(new URL("/choose-plan?error=missing_user", request.url));
    }

    // Activate the plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        stripeCustomerId: checkoutSession.customer as string,
      },
    });

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        stripeCustomerId: checkoutSession.customer as string,
        stripeSubscriptionId: checkoutSession.subscription as string,
        status: "active",
      },
      update: {
        plan,
        stripeCustomerId: checkoutSession.customer as string,
        stripeSubscriptionId: checkoutSession.subscription as string,
        status: "active",
      },
    });

    console.log(`✅ User ${userId} activated ${plan} plan via checkout success callback`);

    // Redirect to dashboard with success indicator
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL(`/dashboard?plan_activated=${plan}`, baseUrl));
  } catch (error) {
    console.error("Checkout success error:", error);
    return NextResponse.redirect(new URL("/choose-plan?error=activation_failed", request.url));
  }
}
