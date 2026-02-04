"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Pattern, Favorite } from "@/lib/types";

export default function PatternDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const patternId = params.id as string;

  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }

    const fetchPattern = async () => {
      const { data } = await supabase.from("patterns").select("*").eq("id", patternId).single();
      if (data) setPattern(data);
    };

    const checkFavorite = async () => {
      const { data } = await supabase.from("favorites").select("id").eq("pattern_id", patternId).eq("user_id", user.id).single();
      if (data) { setIsFavorite(true); setFavoriteId(data.id); }
    };

    fetchPattern();
    checkFavorite();
  }, [user, patternId]);

  const toggleFavorite = async () => {
    if (!user) return;
    if (isFavorite && favoriteId) {
      await supabase.from("favorites").delete().eq("id", favoriteId);
      setIsFavorite(false);
      setFavoriteId(null);
    } else {
      const { data } = await supabase.from("favorites").insert({ user_id: user.id, pattern_id: patternId }).select().single();
      if (data) { setIsFavorite(true); setFavoriteId(data.id); }
    }
  };

  const addToQueue = async () => {
    if (!user || !pattern) return;
    await supabase.from("queue").insert({
      user_id: user.id,
      pattern_id: patternId,
      pattern_name: pattern.name,
      priority: 0,
    });
    alert("Added to queue!");
  };

  const deletePattern = async () => {
    if (!pattern || pattern.user_id !== user?.id) return;
    await supabase.from("patterns").delete().eq("id", pattern.id);
    router.push("/patterns");
  };

  if (!user || !pattern) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  const difficultyDots = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`inline-block h-3 w-3 rounded-full ${i < pattern.difficulty ? "bg-[var(--primary)]" : "bg-zinc-200 dark:bg-zinc-600"}`} />
  ));

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/patterns" className="hover:text-[var(--primary)]">Patterns</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">{pattern.name}</span>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-1">{pattern.name}</h1>
              {pattern.author && <p className="text-sm text-zinc-500">by {pattern.author}</p>}
            </div>
            <div className="flex items-center gap-2">
              {pattern.is_free ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">Free</span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">${pattern.price}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={toggleFavorite}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isFavorite
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
              }`}
            >
              {isFavorite ? "Favorited" : "Favorite"}
            </button>
            <button
              onClick={addToQueue}
              className="rounded-lg border border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              Add to Queue
            </button>
            {pattern.url && (
              <a
                href={pattern.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] transition-colors"
              >
                View Pattern
              </a>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 sm:grid-cols-3">
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase">Craft</span>
              <p className="text-sm font-medium capitalize mt-1">{pattern.craft}</p>
            </div>
            {pattern.category && (
              <div>
                <span className="text-xs font-medium text-zinc-400 uppercase">Category</span>
                <p className="text-sm font-medium capitalize mt-1">{pattern.category}</p>
              </div>
            )}
            {pattern.yarn_weight && (
              <div>
                <span className="text-xs font-medium text-zinc-400 uppercase">Yarn Weight</span>
                <p className="text-sm font-medium capitalize mt-1">{pattern.yarn_weight}</p>
              </div>
            )}
            {pattern.needle_size && (
              <div>
                <span className="text-xs font-medium text-zinc-400 uppercase">Needle Size</span>
                <p className="text-sm font-medium mt-1">{pattern.needle_size}</p>
              </div>
            )}
            {pattern.gauge && (
              <div>
                <span className="text-xs font-medium text-zinc-400 uppercase">Gauge</span>
                <p className="text-sm font-medium mt-1">{pattern.gauge}</p>
              </div>
            )}
            {pattern.yardage && (
              <div>
                <span className="text-xs font-medium text-zinc-400 uppercase">Yardage</span>
                <p className="text-sm font-medium mt-1">{pattern.yardage} yards</p>
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase">Difficulty</span>
              <div className="flex gap-1 mt-1">{difficultyDots}</div>
            </div>
          </div>

          {/* Description */}
          {pattern.description && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Description</h2>
              <p className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{pattern.description}</p>
            </div>
          )}

          {/* Owner actions */}
          {pattern.user_id === user.id && (
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <button onClick={deletePattern} className="text-sm text-red-500 hover:text-red-700">
                Delete Pattern
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
