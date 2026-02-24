"use client";

import { useState, useMemo, useEffect } from "react";
import directory from "@/data/directory.json";

type Entry = {
  name: string;
  phone?: string;
  phone2?: string;
  note?: string;
};

type Category = {
  category: string;
  entries: Entry[];
};

type Reaction = { up: number; down: number; comments: number };
type Comment = { text: string; timestamp: number; author?: string };

// Priority categories appear first
const PRIORITY = [
  "Ambulance Services",
  "Helplines",
  "Pharmacies",
  "Doctors",
  "Nurse",
  "Labs",
  "Bicycle Repair",
  "Puncture Repair",
  "Plumber",
  "AC Technician",
  "Carpenter",
  "Electrician",
  "Courier",
  "Cab Service / Airport Taxi",
  "Meal Service",
];

function makeKey(category: string, name: string): string {
  const slug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug(category)}--${slug(name)}`;
}

function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Ambulance Services": "🚑",
    "Helplines": "📞",
    "Aadhaar Enrolment": "🪪",
    "AC Technician": "❄️",
    "Internet": "🌐",
    "Art Galleries": "🎨",
    "Bird / Animal Rescue": "🐦",
    "Bicycle Repair": "🚲",
    "Cab Service / Airport Taxi": "🚖",
    "Call Driver / Spare Driver": "🧑‍✈️",
    "Chartered Accountants / CA": "🧾",
    "Car Cleaning": "🚿",
    "Carpenter": "🪚",
    "Courier": "📦",
    "Curtains and Blinds": "🪟",
    "Doctors": "🩺",
    "Driving School": "🚗",
    "Ekhata": "📝",
    "Eye Specialists": "👁️",
    "Frames": "🖼️",
    "Guitar Teacher": "🎸",
    "Home Deliveries": "🛵",
    "Labs": "🔬",
    "Laptop Repair": "💻",
    "Meal Service": "🍱",
    "Nephrologist": "🏥",
    "Newspaper Delivery": "📰",
    "Ortho Doctors": "🦴",
    "Notary": "📜",
    "Nurse": "💉",
    "Pedicure": "🦶",
    "Pharmacies": "💊",
    "Pigeon Net": "🕊️",
    "Plumber": "🔧",
    "Police": "🚔",
    "Photocopy": "🖨️",
    "Pulmonologist": "🫁",
    "Puncture Repair": "🛞",
    "RTO Agent": "📋",
    "Sports": "🏸",
    "Stationery": "✏️",
    "Service Technicians": "🔧",
    "Wine / Liquor Delivery": "🍷",
    "Taxi": "🚕",
    "Tailor": "🧵",
    "Travel Agency": "✈️",
    "TV Repair": "📺",
  };
  return icons[category] ?? "📌";
}

function formatPhone(raw: string): string {
  const cleaned = raw.replace(/\s+/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  return "+91" + cleaned.replace(/^0/, "");
}

function PhoneLink({ phone }: { phone: string }) {
  return (
    <a
      href={`tel:${formatPhone(phone)}`}
      className="inline-flex items-center gap-1 text-teal-600 font-medium hover:underline text-sm sm:text-xs"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
      </svg>
      {phone}
    </a>
  );
}

function CategoryCard({
  category,
  entries,
  reactions,
  onReact,
  onOpenComments,
}: {
  category: string;
  entries: Entry[];
  reactions: Record<string, Reaction>;
  onReact: (key: string, type: "up" | "down") => void;
  onOpenComments: (key: string, entryName: string) => void;
}) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col sm:h-[180px]">
      {/* Card header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <span className="text-xl">{categoryIcon(category)}</span>
        <h2 className="text-white font-semibold text-base sm:text-sm">{category}</h2>
      </div>
      {/* Entries — scrollable on desktop, fully expanded on mobile */}
      <div className="divide-y divide-gray-100 sm:overflow-y-auto sm:flex-1">
        {entries.map((entry, i) => {
          const key = makeKey(category, entry.name);
          const r = reactions[key];
          const hasActivity = !!(r?.up || r?.down || r?.comments);
          const isExpanded = expandedKey === key;
          const showReactions = hasActivity || isExpanded;
          return (
            <div key={i} className="group px-4 py-2.5 flex flex-col gap-0.5">
              <div className="flex items-start gap-1">
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="text-gray-800 text-base sm:text-sm font-medium leading-snug">{entry.name}</p>
                  {entry.phone && <PhoneLink phone={entry.phone} />}
                  {entry.phone2 && <PhoneLink phone={entry.phone2} />}
                  {entry.note && <p className="text-sm sm:text-xs text-gray-400 italic">{entry.note}</p>}
                </div>
                {/* Mobile-only tap trigger */}
                <button
                  className="sm:hidden mt-0.5 px-1 text-teal-600 hover:text-teal-800 transition-colors flex-shrink-0 text-base leading-snug"
                  onClick={() => setExpandedKey(isExpanded ? null : key)}
                  title="React"
                >
                  ···
                </button>
              </div>
              {/* Mobile: visible when tapped or has activity. Desktop: visible on row hover. */}
              <div className={[showReactions ? "flex" : "hidden", "sm:hidden sm:group-hover:flex items-center gap-3 mt-0.5"].join(" ")}>
                <button
                  onClick={() => onReact(key, "up")}
                  className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-green-600 transition-colors"
                  title="Helpful"
                >
                  👍 <span>{r?.up || 0}</span>
                </button>
                <button
                  onClick={() => onReact(key, "down")}
                  className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  title="Not helpful"
                >
                  👎 <span>{r?.down || 0}</span>
                </button>
                <button
                  onClick={() => onOpenComments(key, entry.name)}
                  className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-teal-600 transition-colors"
                  title="Comments"
                >
                  💬 <span>{r?.comments || 0}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});
  const [commentPanel, setCommentPanel] = useState<{ key: string; entryName: string } | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");

  useEffect(() => {
    fetch("/api/reactions")
      .then((r) => r.json())
      .then(setReactions)
      .catch(() => {});
  }, []);

  const handleReact = async (key: string, type: "up" | "down") => {
    // Optimistic update
    setReactions((prev) => {
      const existing = prev[key] ?? { up: 0, down: 0, comments: 0 };
      return { ...prev, [key]: { ...existing, [type]: (Number(existing[type]) || 0) + 1 } };
    });
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, type }),
      });
      const data = await res.json();
      setReactions((prev) => ({ ...prev, [key]: data }));
    } catch {
      // revert on error
      setReactions((prev) => {
        const existing = prev[key] ?? { up: 0, down: 0, comments: 0 };
        return { ...prev, [key]: { ...existing, [type]: Math.max(0, (Number(existing[type]) || 0) - 1) } };
      });
    }
  };

  const handleOpenComments = async (key: string, entryName: string) => {
    setCommentPanel({ key, entryName });
    setCommentText("");
    setComments([]);
    try {
      const res = await fetch(`/api/comments?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    }
  };

  const handleComment = async () => {
    if (!commentPanel || !commentText.trim()) return;
    const text = commentText.trim();
    const author = commentAuthor.trim() || "Anonymous";
    setCommentText("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: commentPanel.key, text, author }),
      });
      const comment = await res.json();
      setComments((prev) => [comment, ...prev]);
      setReactions((prev) => {
        const existing = prev[commentPanel.key] ?? { up: 0, down: 0, comments: 0 };
        return { ...prev, [commentPanel.key]: { ...existing, comments: (Number(existing.comments) || 0) + 1 } };
      });
    } catch {
      setCommentText(text); // restore on error
    }
  };

  const sorted = useMemo(() => {
    const data = directory as Category[];
    const priority = PRIORITY.map((p) => data.find((c) => c.category === p)).filter(Boolean) as Category[];
    const rest = data.filter((c) => !PRIORITY.includes(c.category));
    return [...priority, ...rest];
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (c) =>
        c.category.toLowerCase().includes(q) ||
        c.entries.some(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.phone?.includes(q) ||
            e.phone2?.includes(q)
        )
    );
  }, [search, sorted]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header with search */}
      <header className="bg-teal-800 text-white px-6 py-3 shadow-md flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-tight">Petunia Directory</h1>
          <p className="text-teal-200 text-xs">Community services &amp; contacts</p>
        </div>
        <input
          type="search"
          placeholder="Search categories, names or numbers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm text-sm px-4 py-2 rounded-lg bg-white border border-teal-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </header>

      {/* Cards grid */}
      <main className="flex-1 p-6">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center mt-20 text-sm">No results found</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((cat) => (
              <CategoryCard
                key={cat.category}
                category={cat.category}
                entries={cat.entries}
                reactions={reactions}
                onReact={handleReact}
                onOpenComments={handleOpenComments}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 text-center text-xs text-gray-400 py-2">
        Petunia Directory — managed by the community
      </footer>

      {/* Comments modal */}
      {commentPanel && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setCommentPanel(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h3 className="text-white font-semibold text-sm truncate pr-2">
                💬 {commentPanel.entryName}
              </h3>
              <button
                onClick={() => setCommentPanel(null)}
                className="text-gray-400 hover:text-white text-lg leading-none flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[100px]">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 text-sm">{c.text}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      <span className="font-medium text-gray-500">{c.author || "Anonymous"}</span>
                      {" · "}
                      {new Date(c.timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-gray-100 p-3 flex flex-col gap-2">
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Your name (optional)"
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-600"
                maxLength={50}
              />
              <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Add a comment…"
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                maxLength={500}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="bg-teal-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-600 disabled:opacity-40"
              >
                Post
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
