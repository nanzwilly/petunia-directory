"use client";

import { useState } from "react";
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

function formatPhone(raw: string): string {
  const cleaned = raw.replace(/\s+/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  return "+91" + cleaned.replace(/^0/, "");
}

function PhoneLink({ phone }: { phone: string }) {
  return (
    <a
      href={`tel:${formatPhone(phone)}`}
      className="inline-flex items-center gap-1 text-purple-700 font-medium hover:underline text-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
      </svg>
      {phone}
    </a>
  );
}

export default function Home() {
  const [selected, setSelected] = useState<Category>(directory[0] as Category);
  const [search, setSearch] = useState("");

  const filtered = directory.filter((c) =>
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-900 text-white px-6 py-4 shadow-md flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Petunia Directory</h1>
        <p className="text-purple-300 text-sm mt-0.5">Community services &amp; contacts</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-800 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-700">
            <input
              type="search"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <nav className="overflow-y-auto flex-1">
            {filtered.map((cat) => (
              <button
                key={cat.category}
                onClick={() => {
                  setSelected(cat as Category);
                  setSearch("");
                }}
                className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-700 transition-colors ${
                  selected.category === cat.category
                    ? "bg-purple-700 text-white font-semibold"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {cat.category}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-500 text-sm px-4 py-6 text-center">No categories found</p>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{selected.category}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(selected.entries as Entry[]).map((entry, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-1"
              >
                <p className="font-semibold text-gray-800 text-sm leading-snug">{entry.name}</p>
                {entry.phone && <PhoneLink phone={entry.phone} />}
                {entry.phone2 && <PhoneLink phone={entry.phone2} />}
                {entry.note && (
                  <p className="text-xs text-gray-400 italic">{entry.note}</p>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 text-center text-xs text-gray-400 py-2 flex-shrink-0">
        Petunia Directory — managed by the community
      </footer>
    </div>
  );
}
