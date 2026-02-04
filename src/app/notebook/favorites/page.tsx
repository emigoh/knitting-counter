"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Favorite, Pattern } from "@/lib/types";

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [favorites, setFavorites] = useState<(Favorite & { pattern: Pattern })[]>([]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    const { data } = await supabase
      .from("favorites")
      .select("*, pattern:patterns(*)")
      .order("created_at", { ascending: false });
    if (data) setFavorites(data as (Favorite & { pattern: Pattern })[]);
  };

  const removeFavorite = async (id: string) => {
    await supabase.from("favorites").delete().eq("id", id);
    fetchFavorites();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Favorites</h1>
          <p className="text-sm text-zinc-500 mt-1">{favorites.length} favorited pattern{favorites.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map(fav => {
            const p = fav.pattern;
            if (!p) return null;
            return (
              <div key={fav.id} className="rounded-xl bg-white p-5 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/patterns/${p.id}`} className="font-semibold text-[var(--foreground)] hover:text-[var(--primary)] hover:underline line-clamp-1">
                    {p.name}
                  </Link>
                  <button onClick={() => removeFavorite(fav.id)} className="text-red-400 hover:text-red-600 shrink-0 ml-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                {p.author && <p className="text-xs text-zinc-500 mb-2">by {p.author}</p>}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)] capitalize">{p.craft}</span>
                  {p.category && (
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 capitalize dark:bg-zinc-700 dark:text-zinc-300">{p.category}</span>
                  )}
                  {p.is_free ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Free</span>
                  ) : (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">${p.price}</span>
                  )}
                </div>
                {p.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2">{p.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {favorites.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-zinc-500">No favorites yet</p>
            <Link href="/patterns" className="mt-2 inline-block text-sm text-[var(--primary)] hover:underline">
              Browse patterns to find something you love
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
