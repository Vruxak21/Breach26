import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { checkFeatureAccess } from "@/lib/plan-access";

// POST /api/invitations — Send an invitation (Pro only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Plan-based access check: collaboration is Pro only
    const hasAccess = await checkFeatureAccess(session.user.id, "invitations");
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Upgrade to Pro to access group collaboration features" },
        { status: 403 }
      );
    }

    const { itineraryId, email, role, message } = await request.json();

    if (!itineraryId || !email) {
      return NextResponse.json({ error: "itineraryId and email are required" }, { status: 400 });
    }

    if (email === session.user.email) {
      return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 });
    }

    // Check that the user owns the itinerary
    const itinerary = await prisma.itinerary.findFirst({
      where: { id: itineraryId, userId: session.user.id },
    });
    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found or not owned by you" }, { status: 404 });
    }

    // Check if already invited
    const existing = await prisma.invitation.findFirst({
      where: { itineraryId, receiverEmail: email, status: "pending" },
    });
    if (existing) {
      return NextResponse.json({ error: "Invitation already sent to this email" }, { status: 409 });
    }

    // Try to find the receiver user
    const receiverUser = await prisma.user.findUnique({ where: { email } });

    const invitation = await prisma.invitation.create({
      data: {
        itineraryId,
        senderId: session.user.id,
        receiverEmail: email,
        receiverId: receiverUser?.id || null,
        role: role || "editor",
        message: message || null,
      },
      include: {
        itinerary: { select: { title: true, destination: true } },
        sender: { select: { name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Send invitation error:", error);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}

// GET /api/invitations — Get all pending invitations for current user
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        OR: [
          { receiverEmail: session.user.email },
          { receiverId: session.user.id },
        ],
        status: "pending",
      },
      include: {
        itinerary: { select: { id: true, title: true, destination: true, coverImage: true, totalDays: true, travelers: true } },
        sender: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Fetch invitations error:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}
