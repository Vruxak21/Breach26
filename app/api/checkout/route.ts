import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();
    if (!plan || !["basic", "pro"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ── Basic plan is FREE — activate directly, no Stripe ──
    if (plan === "basic") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { plan: "basic" },
      });

      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          plan: "basic",
          status: "active",
        },
        update: {
          plan: "basic",
          status: "active",
        },
      });

      return NextResponse.json({ url: `/dashboard?plan_activated=basic` });
    }

    // ── Pro plan — Stripe checkout at $10/month ──
    const priceEnv = process.env.STRIPE_PRO_PRICE_ID;

    // Determine if we have a valid Stripe Price ID (starts with price_) or we need to use dynamic price data
    const isPriceId = priceEnv?.startsWith("price_");

    const lineItem = isPriceId
      ? { price: priceEnv, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: "TravelMind Pro",
              description: "For groups & power planners",
            },
            unit_amount: 1000, // $10 in cents
            recurring: { interval: "month" },
          },
          quantity: 1,
        };

    // Get or create Stripe customer
    let customerId = (
      await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true },
      })
    )?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const baseUrl = process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [lineItem as any],
      mode: "subscription",
      success_url: `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/choose-plan`,
      metadata: {
        userId: session.user.id,
        plan: "pro",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
