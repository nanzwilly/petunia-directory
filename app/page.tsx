"use client";

import { useState, useMemo } from "react";
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
  "Police",
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

function CategoryCard({ category, entries }: { category: string; entries: Entry[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col sm:h-[180px]">
      {/* Card header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <span className="text-xl">{categoryIcon(category)}</span>
        <h2 className="text-white font-semibold text-base sm:text-sm">{category}</h2>
      </div>
      {/* Entries — scrollable on desktop, fully expanded on mobile */}
      <div className="divide-y divide-gray-100 sm:overflow-y-auto sm:flex-1">
        {entries.map((entry, i) => (
          <div key={i} className="px-4 py-2.5 flex flex-col gap-0.5">
            <p className="text-gray-800 text-base sm:text-sm font-medium leading-snug">{entry.name}</p>
            {entry.phone && <PhoneLink phone={entry.phone} />}
            {entry.phone2 && <PhoneLink phone={entry.phone2} />}
            {entry.note && <p className="text-sm sm:text-xs text-gray-400 italic">{entry.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");

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
