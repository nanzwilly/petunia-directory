import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

type Comment = { text: string; timestamp: number; author?: string };

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const redis = getRedis();
    const raw = await redis.lrange(`comments:${key}`, 0, 49);
    // Upstash may return items as strings or objects — normalise both
    const comments: Comment[] = raw
      .map((item) => {
        if (typeof item === "string") {
          try { return JSON.parse(item) as Comment; } catch { return null; }
        }
        return item as Comment;
      })
      .filter((c): c is Comment => !!c && typeof c.text === "string");
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, text, author } = (await request.json()) as { key: string; text: string; author?: string };
    if (!key || !text?.trim()) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const comment: Comment = {
      text: text.trim().slice(0, 500),
      timestamp: Date.now(),
      author: author?.trim().slice(0, 50) || "Anonymous",
    };
    const redis = getRedis();
    await Promise.all([
      redis.lpush(`comments:${key}`, comment),
      redis.hincrby(`reactions:${key}`, "comments", 1),
    ]);

    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
