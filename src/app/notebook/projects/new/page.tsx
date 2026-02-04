"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { StashYarn } from "@/lib/types";
import { PROJECT_COLORS, PROJECT_STATUSES, CRAFT_TYPES } from "@/lib/constants";
import HappinessRating from "@/components/HappinessRating";

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [stashYarns, setStashYarns] = useState<StashYarn[]>([]);
  const [projectCount, setProjectCount] = useState(0);

  const [form, setForm] = useState({
    name: "",
    status: "in_progress",
    craft: "knitting",
    pattern_name: "",
    needle_size: "",
    gauge: "",
    started_at: new Date().toISOString().split("T")[0],
    completed_at: "",
    notes: "",
    progress: 0,
    made_for: "",
    happiness: 0,
    yarn_id: "",
  });

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    supabase.from("stash").select("*").then(({ data }) => { if (data) setStashYarns(data); });
    supabase.from("projects").select("id", { count: "exact", head: true }).then(({ count }) => { if (count !== null) setProjectCount(count); });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: form.name.trim(),
      row_count: 0,
      color_index: projectCount % PROJECT_COLORS.length,
      status: form.status,
      craft: form.craft,
      pattern_name: form.pattern_name || null,
      needle_size: form.needle_size || null,
      gauge: form.gauge || null,
      started_at: form.started_at || null,
      completed_at: form.completed_at || null,
      notes: form.notes || null,
      progress: form.progress,
      made_for: form.made_for || null,
      happiness: form.happiness,
      yarn_id: form.yarn_id || null,
      photos: [],
    });

    if (!error) {
      router.push("/notebook/projects");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/notebook/projects" className="hover:text-[var(--primary)]">Projects</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">New Project</span>
        </div>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Create New Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Project Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="My cozy sweater"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                {PROJECT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
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
              <label className="block text-xs font-medium text-zinc-500 mb-1">Pattern Name</label>
              <input
                value={form.pattern_name}
                onChange={e => setForm({ ...form, pattern_name: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
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
                placeholder="e.g., 20 sts x 26 rows = 4 in"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Made For</label>
              <input
                value={form.made_for}
                onChange={e => setForm({ ...form, made_for: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Yarn from Stash</label>
              <select
                value={form.yarn_id}
                onChange={e => setForm({ ...form, yarn_id: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                <option value="">None</option>
                {stashYarns.map(y => <option key={y.id} value={y.id}>{y.yarn_name} - {y.color}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Started</label>
              <input
                type="date"
                value={form.started_at}
                onChange={e => setForm({ ...form, started_at: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Happiness</label>
              <HappinessRating value={form.happiness} onChange={v => setForm({ ...form, happiness: v })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]">
              Create Project
            </button>
            <Link href="/notebook/projects" className="rounded-lg border border-zinc-300 px-6 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
