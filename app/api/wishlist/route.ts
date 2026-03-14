import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { addedByUserId: session.user.id },
      include: {
        itinerary: {
          select: {
            id: true,
            title: true,
            destination: true,
            country: true,
            coverImage: true,
            totalDays: true,
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.type || !body.data) {
      return NextResponse.json({ error: "type and data are required" }, { status: 400 });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        addedByUserId: session.user.id,
        itineraryId: body.itineraryId || null,
        type: body.type,
        externalId: body.externalId || null,
        data: body.data,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Create wishlist item error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
    }

    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.addedByUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.wishlistItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete wishlist item error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
