import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
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
    const { optionId } = await req.json();

    if (!optionId) {
      return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
    }

    const optionRows = await prisma.$queryRaw<
      Array<{ id: string; pollId: string; itineraryId: string }>
    >`
      SELECT
        o.id,
        o."pollId" as "pollId",
        p."itineraryId" as "itineraryId"
      FROM poll_option o
      JOIN poll p ON p.id = o."pollId"
      WHERE o.id = ${optionId}
        AND o."pollId" = ${pollId}
      LIMIT 1
    `;

    const option = optionRows[0];
    if (!option) {
      return NextResponse.json({ error: "Invalid option for poll" }, { status: 400 });
    }

    if (option.itineraryId !== id) {
      return NextResponse.json({ error: "Poll does not belong to this itinerary" }, { status: 400 });
    }

    const upsertedVote = await prisma.$queryRaw<
      Array<{ id: string; pollId: string; optionId: string; userId: string; createdAt: Date }>
    >`
      INSERT INTO vote (id, "pollId", "optionId", "userId")
      VALUES (gen_random_uuid(), ${pollId}, ${optionId}, ${session.user.id})
      ON CONFLICT ("pollId", "userId")
      DO UPDATE SET "optionId" = EXCLUDED."optionId"
      RETURNING id, "pollId" as "pollId", "optionId" as "optionId", "userId" as "userId", "createdAt" as "createdAt"
    `;

    const vote = upsertedVote[0];

    return NextResponse.json(vote);
  } catch (error) {
    console.error("[POLL_VOTE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
