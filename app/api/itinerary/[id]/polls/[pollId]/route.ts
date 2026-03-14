import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, pollId } = await params;

    // Find the poll and verify the user is the creator
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Only the poll creator can delete it" }, { status: 403 });
    }

    if (poll.itineraryId !== id) {
      return NextResponse.json({ error: "Poll does not belong to this itinerary" }, { status: 400 });
    }

    // Delete poll — cascades to options and votes
    await prisma.poll.delete({
      where: { id: pollId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POLL_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
