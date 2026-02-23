import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function GET() {
  try {
    const redis = getRedis();
    const keys = await redis.keys("reactions:*");
    if (keys.length === 0) return NextResponse.json({});

    const results: Record<string, { up: number; down: number; comments: number }> = {};
    await Promise.all(
      keys.map(async (key) => {
        const data = await redis.hgetall<{ up?: string; down?: string; comments?: string }>(key);
        const entryKey = key.slice("reactions:".length);
        results[entryKey] = {
          up: Number(data?.up ?? 0),
          down: Number(data?.down ?? 0),
          comments: Number(data?.comments ?? 0),
        };
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, type } = (await request.json()) as { key: string; type: "up" | "down" };
    if (!key || !["up", "down"].includes(type)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const redis = getRedis();
    await redis.hincrby(`reactions:${key}`, type, 1);
    const data = await redis.hgetall<{ up?: string; down?: string; comments?: string }>(
      `reactions:${key}`
    );

    return NextResponse.json({
      up: Number(data?.up ?? 0),
      down: Number(data?.down ?? 0),
      comments: Number(data?.comments ?? 0),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
