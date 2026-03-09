import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

type MaidEntry = {
  id: string;
  name: string;
  phone: string;
  skills: string;
  availFrom: string; // "06:00" or "24h"
  availTo: string;   // "23:00" or "" when 24h
  postedAt: number;
};

const EXPIRE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// GET /api/maids — list all active entries sorted newest first
export async function GET() {
  try {
    const redis = getRedis();
    const keys = await redis.keys("maid:*");
    if (keys.length === 0) return NextResponse.json([]);

    const entries = await Promise.all(
      keys.map(async (key) => {
        const raw = await redis.get<MaidEntry>(key);
        if (!raw) return null;
        // Upstash may return a string or an object
        const entry: MaidEntry =
          typeof raw === "string" ? JSON.parse(raw) : raw;
        return entry;
      })
    );

    const valid = entries
      .filter((e): e is MaidEntry => !!e)
      .sort((a, b) => b.postedAt - a.postedAt);

    return NextResponse.json(valid);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// POST /api/maids — create a new entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, skills, availFrom, availTo } = body as {
      name: string;
      phone: string;
      skills: string;
      availFrom: string;
      availTo: string;
    };

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: MaidEntry = {
      id,
      name: name.trim(),
      phone: phone.trim(),
      skills: skills?.trim() ?? "",
      availFrom: availFrom ?? "",
      availTo: availTo ?? "",
      postedAt: Date.now(),
    };

    const redis = getRedis();
    await redis.set(`maid:${id}`, JSON.stringify(entry), {
      ex: EXPIRE_SECONDS,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/maids?id=<id> — remove an entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const redis = getRedis();
    await redis.del(`maid:${id}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
