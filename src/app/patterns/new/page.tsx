"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { CRAFT_TYPES, YARN_WEIGHTS, PATTERN_CATEGORIES } from "@/lib/constants";

export default function NewPatternPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    author: "",
    craft: "knitting",
    category: "",
    yarn_weight: "",
    needle_size: "",
    gauge: "",
    yardage: "",
    description: "",
    is_free: true,
    price: "",
    url: "",
    difficulty: 1,
  });

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;

    const { error } = await supabase.from("patterns").insert({
      user_id: user.id,
      name: form.name.trim(),
      author: form.author || null,
      craft: form.craft,
      category: form.category || null,
      yarn_weight: form.yarn_weight || null,
      needle_size: form.needle_size || null,
      gauge: form.gauge || null,
      yardage: form.yardage ? parseInt(form.yardage) : null,
      description: form.description || null,
      is_free: form.is_free,
      price: !form.is_free && form.price ? parseFloat(form.price) : null,
      url: form.url || null,
      difficulty: form.difficulty,
      photos: [],
    });

    if (!error) {
      router.push("/patterns");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/patterns" className="hover:text-[var(--primary)]">Patterns</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">Add Pattern</span>
        </div>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Add Pattern</h1>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Pattern Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Designer/Author</label>
              <input
                value={form.author}
                onChange={e => setForm({ ...form, author: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Craft</label>
              <select
                value={form.craft}
                onChange={e => setForm({ ...form, craft: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                {CRAFT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                <option value="">Select...</option>
                {PATTERN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Yarn Weight</label>
              <select
                value={form.yarn_weight}
                onChange={e => setForm({ ...form, yarn_weight: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                <option value="">Select...</option>
                {YARN_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Needle/Hook Size</label>
              <input
                value={form.needle_size}
                onChange={e => setForm({ ...form, needle_size: e.target.value })}
                placeholder="e.g., US 7 / 4.5mm"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Gauge</label>
              <input
                value={form.gauge}
                onChange={e => setForm({ ...form, gauge: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Yardage</label>
              <input
                type="number"
                value={form.yardage}
                onChange={e => setForm({ ...form, yardage: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Difficulty</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm({ ...form, difficulty: level })}
                    className={`h-8 w-8 rounded-full text-xs font-bold transition-colors ${
                      level <= form.difficulty ? "bg-[var(--primary)] text-white" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-700"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Price</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" checked={form.is_free} onChange={() => setForm({ ...form, is_free: true })} />
                  Free
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" checked={!form.is_free} onChange={() => setForm({ ...form, is_free: false })} />
                  Paid
                </label>
                {!form.is_free && (
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="$"
                    className="w-20 rounded-lg border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                  />
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Pattern URL</label>
              <input
                type="url"
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]">
              Add Pattern
            </button>
            <Link href="/patterns" className="rounded-lg border border-zinc-300 px-6 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
