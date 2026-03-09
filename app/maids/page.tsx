"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type MaidEntry = {
  id: string;
  name: string;
  phone: string;
  skills: string;
  availFrom: string;
  availTo: string;
  postedAt: number;
};

// Generate time options 06:00 to 23:00 in 30-min steps
function buildTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 6; h <= 23; h++) {
    options.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 23) options.push(`${String(h).padStart(2, "0")}:30`);
  }
  return options;
}
const TIME_OPTIONS = buildTimeOptions();

function formatTime(t: string): string {
  if (!t || t === "24h") return "";
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

function formatPhone(raw: string): string {
  const cleaned = raw.replace(/\s+/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  return "+91" + cleaned.replace(/^0/, "");
}

function formatAvailability(entry: MaidEntry): string {
  if (entry.availFrom === "24h") return "24 hours";
  if (!entry.availFrom && !entry.availTo) return "—";
  const from = formatTime(entry.availFrom);
  const to = formatTime(entry.availTo);
  if (from && to) return `${from} – ${to}`;
  if (from) return `From ${from}`;
  return "—";
}

export default function MaidsPage() {
  const [entries, setEntries] = useState<MaidEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [availFrom, setAvailFrom] = useState("06:00");
  const [availTo, setAvailTo] = useState("23:00");
  const [is24h, setIs24h] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    try {
      const res = await fetch("/api/maids");
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/maids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          skills,
          availFrom: is24h ? "24h" : availFrom,
          availTo: is24h ? "" : availTo,
        }),
      });
      if (res.ok) {
        const entry = await res.json();
        setEntries((prev) => [entry, ...prev]);
        setShowForm(false);
        resetForm();
      }
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setPhone("");
    setSkills("");
    setAvailFrom("06:00");
    setAvailTo("23:00");
    setIs24h(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-800 text-white px-6 py-3 shadow-md flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-xl font-bold tracking-tight leading-tight hover:text-teal-100 transition-colors">
            Petunia Directory
          </Link>
          <p className="text-teal-200 text-xs">Listings auto-expire after 30 days</p>
        </div>
        {/* Right: nav pills + add button — all in one row */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <nav className="flex items-center gap-1.5">
            <Link href="/" className="px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-sm font-medium hover:bg-white/25 hover:text-white transition-colors">
              🏠 Directory
            </Link>
            <Link href="/maids" className="px-3 py-1.5 rounded-full bg-white/25 text-white text-sm font-medium hover:bg-white/35 transition-colors">
              🧹 Maids
            </Link>
          </nav>
          <button
            onClick={() => { setShowForm(true); resetForm(); }}
            className="bg-white text-teal-800 text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-teal-50 transition-colors flex-shrink-0"
          >
            + Add Listing
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        {loading ? (
          <p className="text-gray-400 text-center mt-20 text-sm">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-sm mb-4">
              No listings yet. Be the first to add one!
            </p>
            <button
              onClick={() => { setShowForm(true); resetForm(); }}
              className="bg-teal-700 text-white text-sm px-5 py-2 rounded-lg hover:bg-teal-600"
            >
              + Add Listing
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="sm:hidden flex flex-col gap-3">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
                  <p className="font-semibold text-gray-800 text-base">{entry.name}</p>
                  <a
                    href={`tel:${formatPhone(entry.phone)}`}
                    className="inline-flex items-center gap-1 text-teal-600 font-medium hover:underline text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
                    </svg>
                    {entry.phone}
                  </a>
                  {entry.skills && (
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">Skills: </span>
                      {entry.skills}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>🕐 {formatAvailability(entry)}</span>
                    <span>{new Date(entry.postedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 text-white text-left">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Skills</th>
                    <th className="px-4 py-3 font-semibold">Available</th>
                    <th className="px-4 py-3 font-semibold">Posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 align-top">{entry.name}</td>
                      <td className="px-4 py-3 align-top">
                        <a
                          href={`tel:${formatPhone(entry.phone)}`}
                          className="inline-flex items-center gap-1 text-teal-600 font-medium hover:underline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
                          </svg>
                          {entry.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-600 align-top max-w-[200px]">
                        {entry.skills || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 align-top whitespace-nowrap">{formatAvailability(entry)}</td>
                      <td className="px-4 py-3 text-gray-400 align-top whitespace-nowrap text-xs">
                        {new Date(entry.postedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 text-center text-xs text-gray-400 py-2">
        Petunia Directory — managed by the community
      </footer>

      {/* Add listing modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h3 className="text-white font-semibold text-sm">
                🧹 Add Maid Listing
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Maid&apos;s Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunita"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  maxLength={80}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contact Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98765 43210"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  maxLength={20}
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Skills / Experience
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Sweeping, mopping, utensils, cooking"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  maxLength={200}
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Available Time
                </label>

                {/* 24h toggle */}
                <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={is24h}
                    onChange={(e) => setIs24h(e.target.checked)}
                    className="accent-teal-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Available 24 hours</span>
                </label>

                {/* Time pickers */}
                {!is24h && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-0.5">From</label>
                      <select
                        value={availFrom}
                        onChange={(e) => setAvailFrom(e.target.value)}
                        className="w-full text-sm px-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {formatTime(t)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-gray-400 mt-4">–</span>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-0.5">To</label>
                      <select
                        value={availTo}
                        onChange={(e) => setAvailTo(e.target.value)}
                        className="w-full text-sm px-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {formatTime(t)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400">
                This listing will auto-expire in 30 days.
              </p>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !phone.trim()}
                  className="flex-1 text-sm px-4 py-2 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-600 disabled:opacity-40"
                >
                  {submitting ? "Saving…" : "Add Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
