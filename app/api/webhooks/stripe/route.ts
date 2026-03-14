import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as "basic" | "pro";

      if (!userId || !plan) {
        console.error("Missing userId or plan in checkout metadata");
        break;
      }

      // Update user plan
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          stripeCustomerId: session.customer as string,
        },
      });

      // Create or update subscription record
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
        },
        update: {
          plan,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
        },
      });

      console.log(`✅ User ${userId} activated ${plan} plan`);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      const customerId = (subscription.customer as string) || "";

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        const status = subscription.status === "active" ? "active" : subscription.status;
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status,
            ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: "basic" },
        });
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "canceled" },
        });
        console.log(`⚠️ User ${user.id} subscription canceled, reverted to basic`);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
