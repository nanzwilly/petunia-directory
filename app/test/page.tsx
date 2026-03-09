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

// Priority categories appear first
const PRIORITY = [
  "Ambulance Services",
  "Helplines",
  "Pharmacies",
  "Doctors",
  "Acupuncture",
  "Gynecologists",
  "Nurse",
  "Labs/Diagnostic centers",
  "Bicycle Repair",
  "Puncture Repair",
  "Pest Control",
  "Plumber",
  "AC Technician",
  "Carpenter",
  "Electrician",
  "Courier",
  "Cab Service / Airport Taxi",
  "Meal Service",
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function categoryAnchorId(category: string) {
  return `cat-${slugify(category)}`;
}

async function shareCategory(category: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("category", category);
  const shareUrl = url.toString();

  const title = `Petunia Directory — ${category}`;
  const text = `Petunia Directory: ${category}`;

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url: shareUrl });
      return;
    }
  } catch {
    // fall through to copy
  }

  try {
    await navigator.clipboard?.writeText(shareUrl);
    window.alert("Link copied. You can paste it on WhatsApp.");
  } catch {
    window.prompt("Copy this link:", shareUrl);
  }
}

function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Ambulance Services": "🚑",
    "Helplines": "📞",
    "Aadhaar Enrolment": "🪪",
    "AC Technician": "❄️",
    "Acupuncture": "🪡",
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
    "Gynecologists": "🤰",
    "Guitar Teacher": "🎸",
    "Home Deliveries": "🛵",
    "Labs/Diagnostic centers": "🔬",
    "Laptop Repair": "💻",
    "Meal Service": "🍱",
    "Nephrologist": "🏥",
    "Newspaper Delivery": "📰",
    "Ortho Doctors": "🦴",
    "Notary": "📜",
    "Nurse": "💉",
    "Pedicure": "🦶",
    "Pest Control": "🐜",
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
      className="inline-flex items-center gap-1 text-teal-600 font-medium hover:underline text-xs"
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
  anchorId,
  highlight,
}: {
  category: string;
  entries: Entry[];
  anchorId: string;
  highlight: boolean;
}) {
  return (
    <div
      id={anchorId}
      className={[
        "bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col scroll-mt-24",
        highlight ? "border-teal-500 ring-2 ring-teal-200" : "border-gray-200",
      ].join(" ")}
      style={{ height: "180px" }}
    >
      {/* Card header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <span className="text-xl">{categoryIcon(category)}</span>
        <h2 className="text-white font-semibold text-sm flex-1 min-w-0 truncate">{category}</h2>
        <button
          type="button"
          onClick={() => shareCategory(category)}
          className="text-gray-300 hover:text-white transition-colors flex-shrink-0"
          title="Share category"
          aria-label={`Share ${category}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a2.5 2.5 0 000-1.39l7.05-4.11A2.99 2.99 0 0018 7.91a3 3 0 10-2.83-4H15a3 3 0 00.04.49L7.99 8.51A3 3 0 006 7.91a3 3 0 100 6c.73 0 1.4-.26 1.93-.69l7.14 4.18c-.03.16-.07.33-.07.5a3 3 0 103-3z"/>
          </svg>
        </button>
      </div>
      {/* Entries — scrollable */}
      <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
        {entries.map((entry, i) => (
          <div key={i} className="px-4 py-2.5 flex flex-col gap-0.5">
            <p className="text-gray-800 text-sm font-medium leading-snug">{entry.name}</p>
            {entry.phone && <PhoneLink phone={entry.phone} />}
            {entry.phone2 && <PhoneLink phone={entry.phone2} />}
            {entry.note && <p className="text-xs text-gray-400 italic">{entry.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TestPage() {
  const [search, setSearch] = useState("");
  const [focusCategory, setFocusCategory] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const data = directory as Category[];
    const priority = PRIORITY.map((p) => data.find((c) => c.category === p)).filter(Boolean) as Category[];
    const rest = data.filter((c) => !PRIORITY.includes(c.category));
    return [...priority, ...rest];
  }, []);

  const filtered = useMemo(() => {
    if (focusCategory) return sorted.filter((c) => c.category === focusCategory);
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
  }, [focusCategory, search, sorted]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("category");
      if (!raw) return;
      const data = directory as Category[];
      const match = data.find((c) => c.category.toLowerCase() === raw.toLowerCase());
      if (!match) return;
      setFocusCategory(match.category);
      setSearch("");
      requestAnimationFrame(() => {
        document.getElementById(categoryAnchorId(match.category))?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      // ignore
    }
  }, []);

  const clearFocusCategory = () => {
    setFocusCategory(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("category");
      window.history.replaceState({}, "", url.toString());
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header with search */}
      <header className="bg-teal-800 text-white px-6 py-3 shadow-md flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-tight">Petunia Directory</h1>
          <p className="text-teal-200 text-xs">Community services &amp; contacts</p>
        </div>
        {focusCategory ? (
          <div className="flex items-center gap-2 w-full max-w-sm justify-end">
            <div className="text-xs text-teal-100 truncate">
              Showing: <span className="font-semibold">{focusCategory}</span>
            </div>
            <button
              type="button"
              onClick={clearFocusCategory}
              className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
            >
              Clear
            </button>
          </div>
        ) : (
        <input
          type="search"
          placeholder="Search categories, names or numbers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm text-sm px-4 py-2 rounded-lg bg-white border border-teal-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        )}
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
                anchorId={categoryAnchorId(cat.category)}
                highlight={cat.category === focusCategory}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 text-center text-xs text-gray-400 py-2">
        Petunia Directory — managed by the community
      </footer>
    </div>
  );
}
