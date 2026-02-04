"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Pattern } from "@/lib/types";
import { CRAFT_TYPES, YARN_WEIGHTS, PATTERN_CATEGORIES } from "@/lib/constants";

export default function PatternsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [search, setSearch] = useState("");
  const [craftFilter, setCraftFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [weightFilter, setWeightFilter] = useState("");
  const [freeFilter, setFreeFilter] = useState<string>("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchPatterns();
  }, [user]);

  const fetchPatterns = async () => {
    const { data } = await supabase
      .from("patterns")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPatterns(data);
  };

  const filtered = patterns.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.author?.toLowerCase().includes(search.toLowerCase())) return false;
    if (craftFilter && p.craft !== craftFilter) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (weightFilter && p.yarn_weight !== weightFilter) return false;
    if (freeFilter === "free" && !p.is_free) return false;
    if (freeFilter === "paid" && p.is_free) return false;
    return true;
  });

  const difficultyDots = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`inline-block h-2 w-2 rounded-full ${i < level ? "bg-[var(--primary)]" : "bg-zinc-200 dark:bg-zinc-600"}`} />
    ));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Patterns</h1>
            <p className="text-sm text-zinc-500 mt-1">{filtered.length} pattern{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/patterns/new" className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] transition-colors">
            + Add Pattern
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patterns by name or designer..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
          <div className="flex flex-wrap gap-2">
            <select value={craftFilter} onChange={e => setCraftFilter(e.target.value)} className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
              <option value="">All Crafts</option>
              {CRAFT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
              <option value="">All Categories</option>
              {PATTERN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={weightFilter} onChange={e => setWeightFilter(e.target.value)} className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
              <option value="">All Weights</option>
              {YARN_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
            <select value={freeFilter} onChange={e => setFreeFilter(e.target.value)} className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
              <option value="">Free & Paid</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>
            {(search || craftFilter || categoryFilter || weightFilter || freeFilter) && (
              <button
                onClick={() => { setSearch(""); setCraftFilter(""); setCategoryFilter(""); setWeightFilter(""); setFreeFilter(""); }}
                className="rounded-lg px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Patterns Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(pattern => (
            <Link
              key={pattern.id}
              href={`/patterns/${pattern.id}`}
              className="rounded-xl bg-white p-5 shadow-sm border border-[var(--cream-dark)] hover:shadow-md transition-shadow dark:bg-zinc-800 dark:border-zinc-700"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[var(--foreground)] line-clamp-1">{pattern.name}</h3>
                {pattern.is_free ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Free</span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">${pattern.price}</span>
                )}
              </div>
              {pattern.author && (
                <p className="text-xs text-zinc-500 mb-2">by {pattern.author}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)] capitalize">{pattern.craft}</span>
                {pattern.category && (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 capitalize dark:bg-zinc-700 dark:text-zinc-300">{pattern.category}</span>
                )}
                {pattern.yarn_weight && (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 capitalize dark:bg-zinc-700 dark:text-zinc-300">{pattern.yarn_weight}</span>
                )}
              </div>
              {pattern.description && (
                <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{pattern.description}</p>
              )}
              <div className="flex items-center gap-1">
                {difficultyDots(pattern.difficulty)}
                <span className="ml-1 text-xs text-zinc-400">difficulty</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-zinc-500">No patterns found</p>
            <Link href="/patterns/new" className="mt-2 inline-block text-sm text-[var(--primary)] hover:underline">
              Add the first pattern
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
