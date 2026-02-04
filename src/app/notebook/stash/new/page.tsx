"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { YARN_WEIGHTS } from "@/lib/constants";

export default function NewStashPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    yarn_name: "",
    brand: "",
    color: "",
    colorway: "",
    weight: "worsted",
    fiber_content: "",
    yardage: "",
    skeins: "1",
    notes: "",
  });

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.yarn_name.trim()) return;

    const { error } = await supabase.from("stash").insert({
      user_id: user.id,
      yarn_name: form.yarn_name.trim(),
      brand: form.brand || null,
      color: form.color || null,
      colorway: form.colorway || null,
      weight: form.weight,
      fiber_content: form.fiber_content || null,
      yardage: form.yardage ? parseInt(form.yardage) : null,
      skeins: parseFloat(form.skeins) || 1,
      notes: form.notes || null,
      photos: [],
    });

    if (!error) {
      router.push("/notebook/stash");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/notebook/stash" className="hover:text-[var(--accent)]">Stash</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">Add Yarn</span>
        </div>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Add Yarn to Stash</h1>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Yarn Name *</label>
              <input
                value={form.yarn_name}
                onChange={e => setForm({ ...form, yarn_name: e.target.value })}
                required
                placeholder="e.g., Malabrigo Rios"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Brand</label>
              <input
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Color</label>
              <input
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Colorway</label>
              <input
                value={form.colorway}
                onChange={e => setForm({ ...form, colorway: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Weight</label>
              <select
                value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                {YARN_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Fiber Content</label>
              <input
                value={form.fiber_content}
                onChange={e => setForm({ ...form, fiber_content: e.target.value })}
                placeholder="e.g., 100% Superwash Merino"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Yardage (per skein)</label>
              <input
                type="number"
                value={form.yardage}
                onChange={e => setForm({ ...form, yardage: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Number of Skeins</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={form.skeins}
                onChange={e => setForm({ ...form, skeins: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-medium text-white hover:brightness-110">
              Add to Stash
            </button>
            <Link href="/notebook/stash" className="rounded-lg border border-zinc-300 px-6 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
