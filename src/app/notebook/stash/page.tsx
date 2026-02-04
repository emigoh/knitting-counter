"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { StashYarn } from "@/lib/types";
import { YARN_WEIGHTS } from "@/lib/constants";

export default function StashPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [yarns, setYarns] = useState<StashYarn[]>([]);
  const [search, setSearch] = useState("");
  const [weightFilter, setWeightFilter] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchStash();
  }, [user]);

  const fetchStash = async () => {
    const { data } = await supabase
      .from("stash")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setYarns(data);
  };

  const deleteYarn = async (id: string) => {
    await supabase.from("stash").delete().eq("id", id);
    fetchStash();
  };

  const filtered = yarns.filter(y => {
    if (search && !y.yarn_name.toLowerCase().includes(search.toLowerCase()) && !y.brand?.toLowerCase().includes(search.toLowerCase())) return false;
    if (weightFilter && y.weight !== weightFilter) return false;
    return true;
  });

  const totalYardage = filtered.reduce((sum, y) => sum + (y.yardage || 0) * y.skeins, 0);
  const totalSkeins = filtered.reduce((sum, y) => sum + y.skeins, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Yarn Stash</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {filtered.length} yarn{filtered.length !== 1 ? "s" : ""} &middot; {totalSkeins} skein{totalSkeins !== 1 ? "s" : ""} &middot; {totalYardage.toLocaleString()} yards
            </p>
          </div>
          <Link href="/notebook/stash/new" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-all">
            + Add Yarn
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search yarn name or brand..."
            className="flex-1 min-w-[200px] rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
          <select value={weightFilter} onChange={e => setWeightFilter(e.target.value)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
            <option value="">All Weights</option>
            {YARN_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>

        {/* Stash Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(yarn => (
            <div key={yarn.id} className="rounded-xl bg-white p-5 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">{yarn.yarn_name}</h3>
                  {yarn.brand && <p className="text-xs text-zinc-500">{yarn.brand}</p>}
                </div>
                <button onClick={() => deleteYarn(yarn.id)} className="text-xs text-red-400 hover:text-red-600">
                  Remove
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {yarn.color && (
                  <span className="rounded bg-pink-50 px-2 py-0.5 text-xs text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">{yarn.color}</span>
                )}
                {yarn.colorway && (
                  <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{yarn.colorway}</span>
                )}
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 capitalize dark:bg-zinc-700 dark:text-zinc-300">{yarn.weight}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[var(--cream)] p-2 dark:bg-zinc-700">
                  <div className="text-lg font-bold text-[var(--accent)]">{yarn.skeins}</div>
                  <div className="text-[10px] text-zinc-400">skeins</div>
                </div>
                {yarn.yardage && (
                  <div className="rounded-lg bg-[var(--cream)] p-2 dark:bg-zinc-700">
                    <div className="text-lg font-bold text-[var(--primary)]">{(yarn.yardage * yarn.skeins).toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-400">yards total</div>
                  </div>
                )}
                {yarn.fiber_content && (
                  <div className="rounded-lg bg-[var(--cream)] p-2 dark:bg-zinc-700">
                    <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate">{yarn.fiber_content}</div>
                    <div className="text-[10px] text-zinc-400">fiber</div>
                  </div>
                )}
              </div>
              {yarn.notes && <p className="mt-3 text-xs text-zinc-500 line-clamp-2">{yarn.notes}</p>}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-zinc-500">Your stash is empty</p>
            <Link href="/notebook/stash/new" className="mt-2 inline-block text-sm text-[var(--accent)] hover:underline">
              Add your first yarn
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
