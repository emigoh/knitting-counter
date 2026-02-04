"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { QueueItem } from "@/lib/types";

export default function QueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [addingManual, setAddingManual] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchQueue();
  }, [user]);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });
    if (data) setQueue(data);
  };

  const addToQueue = async () => {
    if (!user || !newName.trim()) return;
    await supabase.from("queue").insert({
      user_id: user.id,
      pattern_name: newName.trim(),
      notes: newNotes || null,
      priority: queue.length,
    });
    setNewName("");
    setNewNotes("");
    setAddingManual(false);
    fetchQueue();
  };

  const removeFromQueue = async (id: string) => {
    await supabase.from("queue").delete().eq("id", id);
    fetchQueue();
  };

  const movePriority = async (id: string, direction: "up" | "down") => {
    const idx = queue.findIndex(q => q.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= queue.length) return;

    const current = queue[idx];
    const swap = queue[swapIdx];

    await Promise.all([
      supabase.from("queue").update({ priority: swap.priority }).eq("id", current.id),
      supabase.from("queue").update({ priority: current.priority }).eq("id", swap.id),
    ]);
    fetchQueue();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Queue</h1>
            <p className="text-sm text-zinc-500 mt-1">{queue.length} pattern{queue.length !== 1 ? "s" : ""} waiting</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAddingManual(true)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              + Add Manually
            </button>
            <Link href="/patterns" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300">
              Browse Patterns
            </Link>
          </div>
        </div>

        {/* Add Manual Form */}
        {addingManual && (
          <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex flex-col gap-3">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Pattern name"
                autoFocus
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
              <input
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
              <div className="flex gap-2">
                <button onClick={addToQueue} className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm text-white">Add</button>
                <button onClick={() => { setAddingManual(false); setNewName(""); setNewNotes(""); }} className="text-sm text-zinc-500">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="space-y-2">
          {queue.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[var(--foreground)] truncate">
                  {item.pattern_id ? (
                    <Link href={`/patterns/${item.pattern_id}`} className="hover:text-[var(--primary)] hover:underline">
                      {item.pattern_name}
                    </Link>
                  ) : (
                    item.pattern_name
                  )}
                </p>
                {item.notes && <p className="text-xs text-zinc-400 truncate">{item.notes}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => movePriority(item.id, "up")}
                  disabled={idx === 0}
                  className="rounded p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 12V4M4 8l4-4 4 4"/></svg>
                </button>
                <button
                  onClick={() => movePriority(item.id, "down")}
                  disabled={idx === queue.length - 1}
                  className="rounded p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 4v8M4 8l4 4 4-4"/></svg>
                </button>
                <button onClick={() => removeFromQueue(item.id)} className="rounded p-1 text-red-400 hover:text-red-600 ml-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {queue.length === 0 && !addingManual && (
          <div className="mt-12 text-center">
            <p className="text-zinc-500">Your queue is empty</p>
            <p className="text-sm text-zinc-400 mt-1">Browse patterns and add them to your queue</p>
          </div>
        )}
      </div>
    </div>
  );
}
