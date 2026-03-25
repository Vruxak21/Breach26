import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type PollRow = {
  id: string;
  itineraryId: string;
  question: string;
  createdBy: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorImage: string | null;
};

type OptionRow = {
  id: string;
  pollId: string;
  text: string;
};

type VoteRow = {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  userName: string;
  userImage: string | null;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const polls = await prisma.$queryRaw<PollRow[]>`
      SELECT
        p.id,
        p."itineraryId" as "itineraryId",
        p.question,
        p."createdBy" as "createdBy",
        p."createdAt" as "createdAt",
        u.id as "authorId",
        u.name as "authorName",
        u.image as "authorImage"
      FROM poll p
      JOIN "user" u ON u.id = p."createdBy"
      WHERE p."itineraryId" = ${id}
      ORDER BY p."createdAt" DESC
    `;

    const normalizedPolls = await Promise.all(
      polls.map(async (poll) => {
        const options = await prisma.$queryRaw<OptionRow[]>`
          SELECT id, "pollId" as "pollId", text
          FROM poll_option
          WHERE "pollId" = ${poll.id}
          ORDER BY id ASC
        `;

        const optionsWithVotes = await Promise.all(
          options.map(async (option) => {
            const votes = await prisma.$queryRaw<VoteRow[]>`
              SELECT
                v.id,
                v."pollId" as "pollId",
                v."optionId" as "optionId",
                v."userId" as "userId",
                u.name as "userName",
                u.image as "userImage"
              FROM vote v
              JOIN "user" u ON u.id = v."userId"
              WHERE v."optionId" = ${option.id}
              ORDER BY v."createdAt" ASC
            `;

            return {
              id: option.id,
              pollId: option.pollId,
              text: option.text,
              votes: votes.map((vote) => ({
                id: vote.id,
                pollId: vote.pollId,
                optionId: vote.optionId,
                userId: vote.userId,
                user: {
                  id: vote.userId,
                  name: vote.userName,
                  image: vote.userImage,
                },
              })),
            };
          })
        );

        return {
          id: poll.id,
          itineraryId: poll.itineraryId,
          question: poll.question,
          createdBy: poll.createdBy,
          createdAt: poll.createdAt,
          author: {
            id: poll.authorId,
            name: poll.authorName,
            image: poll.authorImage,
          },
          options: optionsWithVotes,
        };
      })
    );

    return NextResponse.json(normalizedPolls);
  } catch (error) {
    console.error("[POLLS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { question, options } = body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Question and at least 2 options are required" },
        { status: 400 }
      );
    }

    // Verify user can access itinerary
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!itinerary) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const createdPoll = await prisma.$queryRaw<
      Array<{
        id: string;
        itineraryId: string;
        question: string;
        createdBy: string;
        createdAt: Date;
      }>
    >`
      INSERT INTO poll (id, "itineraryId", question, "createdBy")
      VALUES (gen_random_uuid(), ${id}, ${question}, ${session.user.id})
      RETURNING id, "itineraryId" as "itineraryId", question, "createdBy" as "createdBy", "createdAt" as "createdAt"
    `;

    const poll = createdPoll[0];

    const createdOptions = await Promise.all(
      options.map((opt: string) =>
        prisma.$queryRaw<Array<{ id: string; pollId: string; text: string }>>`
          INSERT INTO poll_option (id, "pollId", text)
          VALUES (gen_random_uuid(), ${poll.id}, ${opt})
          RETURNING id, "pollId" as "pollId", text
        `
      )
    );

    const flattenedOptions = createdOptions.map((rowSet) => rowSet[0]);

    const newPoll = {
      id: poll.id,
      itineraryId: poll.itineraryId,
      question: poll.question,
      createdBy: poll.createdBy,
      createdAt: poll.createdAt,
      author: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image || null,
      },
      options: flattenedOptions.map((opt) => ({
        id: opt.id,
        pollId: opt.pollId,
        text: opt.text,
        votes: [],
      })),
    };

    return NextResponse.json(newPoll, { status: 201 });
  } catch (error) {
    console.error("[POLLS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
