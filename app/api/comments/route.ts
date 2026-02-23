import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

type Comment = { text: string; timestamp: number };

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const redis = getRedis();
    const raw = await redis.lrange<Comment>(`comments:${key}`, 0, 49);
    return NextResponse.json(raw);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, text } = (await request.json()) as { key: string; text: string };
    if (!key || !text?.trim()) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const comment: Comment = { text: text.trim().slice(0, 500), timestamp: Date.now() };
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
