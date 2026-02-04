"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Project, Pattern, StashYarn, QueueItem } from "@/lib/types";
import { PROJECT_COLORS } from "@/lib/constants";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [stash, setStash] = useState<StashYarn[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchAll = async () => {
      const [projectsRes, patternsRes, stashRes, queueRes] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("patterns").select("*").order("created_at", { ascending: false }).limit(4),
        supabase.from("stash").select("*").order("created_at", { ascending: false }).limit(4),
        supabase.from("queue").select("*").order("priority", { ascending: true }).limit(5),
      ]);

      if (projectsRes.data) setProjects(projectsRes.data);
      if (patternsRes.data) setPatterns(patternsRes.data);
      if (stashRes.data) setStash(stashRes.data);
      if (queueRes.data) setQueue(queueRes.data);
    };

    fetchAll();
  }, [user]);

  if (!user) return null;

  const inProgressProjects = projects.filter(p => p.status === "in_progress");
  const getColor = (idx: number) => PROJECT_COLORS[idx % PROJECT_COLORS.length];

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Welcome back!
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Here&apos;s what&apos;s happening in your notebook
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link href="/notebook/projects" className="rounded-xl bg-white p-4 shadow-sm border border-[var(--cream-dark)] hover:shadow-md transition-shadow dark:bg-zinc-800 dark:border-zinc-700">
            <div className="text-2xl font-bold text-[var(--primary)]">{projects.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Projects</div>
          </Link>
          <Link href="/notebook/stash" className="rounded-xl bg-white p-4 shadow-sm border border-[var(--cream-dark)] hover:shadow-md transition-shadow dark:bg-zinc-800 dark:border-zinc-700">
            <div className="text-2xl font-bold text-[var(--accent)]">{stash.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Yarns in Stash</div>
          </Link>
          <Link href="/notebook/queue" className="rounded-xl bg-white p-4 shadow-sm border border-[var(--cream-dark)] hover:shadow-md transition-shadow dark:bg-zinc-800 dark:border-zinc-700">
            <div className="text-2xl font-bold text-violet-600">{queue.length}</div>
            <div className="text-xs text-zinc-500 mt-1">In Queue</div>
          </Link>
          <Link href="/patterns" className="rounded-xl bg-white p-4 shadow-sm border border-[var(--cream-dark)] hover:shadow-md transition-shadow dark:bg-zinc-800 dark:border-zinc-700">
            <div className="text-2xl font-bold text-sky-600">{patterns.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Patterns</div>
          </Link>
        </div>

        {/* In Progress Projects */}
        {inProgressProjects.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">In Progress</h2>
              <Link href="/notebook/projects" className="text-sm text-[var(--primary)] hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {inProgressProjects.slice(0, 4).map((project) => {
                const color = getColor(project.color_index);
                return (
                  <Link
                    key={project.id}
                    href={`/notebook/projects/${project.id}`}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl ${color.bg} p-6 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all aspect-square`}
                  >
                    <span className="text-4xl font-bold tabular-nums text-white">
                      {project.row_count}
                    </span>
                    <span className="text-sm font-medium text-white/90 truncate max-w-full px-2">
                      {project.name}
                    </span>
                    {project.progress > 0 && (
                      <div className="w-full bg-white/30 rounded-full h-1.5 mt-1">
                        <div className="bg-white rounded-full h-1.5" style={{ width: `${project.progress}%` }} />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent from Queue */}
        {queue.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Up Next</h2>
              <Link href="/notebook/queue" className="text-sm text-[var(--primary)] hover:underline">
                View queue
              </Link>
            </div>
            <div className="space-y-2">
              {queue.slice(0, 3).map((item, i) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{item.pattern_name}</span>
                  {item.notes && (
                    <span className="ml-auto text-xs text-zinc-400 truncate max-w-[200px]">{item.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link href="/notebook/projects/new" className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[var(--primary-light)] p-4 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all">
              <span className="text-2xl">+</span>
              <span className="text-xs font-medium">New Project</span>
            </Link>
            <Link href="/patterns/new" className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-sky-300 p-4 text-sky-600 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all">
              <span className="text-2xl">+</span>
              <span className="text-xs font-medium">Add Pattern</span>
            </Link>
            <Link href="/notebook/stash/new" className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 p-4 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all">
              <span className="text-2xl">+</span>
              <span className="text-xs font-medium">Add Yarn</span>
            </Link>
            <Link href="/patterns" className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-violet-300 p-4 text-violet-600 hover:bg-violet-500 hover:text-white hover:border-violet-500 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="text-xs font-medium">Browse Patterns</span>
            </Link>
          </div>
        </section>

        {/* Empty State */}
        {projects.length === 0 && stash.length === 0 && queue.length === 0 && (
          <div className="mt-12 text-center">
            <div className="mx-auto mb-4">
              <svg width="64" height="64" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto opacity-30">
                <circle cx="14" cy="14" r="12" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
                <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-400">Your notebook is empty</h3>
            <p className="text-sm text-zinc-400 mt-1">Start by creating a project or browsing patterns</p>
          </div>
        )}
      </div>
    </div>
  );
}
