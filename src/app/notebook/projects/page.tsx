"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Project } from "@/lib/types";
import { PROJECT_COLORS, PROJECT_STATUSES } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
  }, [user]);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
  }, [user]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`projects-list-${user.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "projects",
        filter: `user_id=eq.${user.id}`
      }, () => { fetchProjects(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchProjects]);

  const addProject = async () => {
    if (!newProjectName.trim() || !user) return;
    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: newProjectName.trim(),
      row_count: 0,
      color_index: projects.length % PROJECT_COLORS.length,
      status: "in_progress",
      craft: "knitting",
      progress: 0,
      happiness: 0,
      photos: [],
    });
    if (!error) {
      setNewProjectName("");
      setIsAdding(false);
      fetchProjects();
    }
  };

  const getColor = (idx: number) => PROJECT_COLORS[idx % PROJECT_COLORS.length];

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Projects</h1>
            <p className="text-sm text-zinc-500 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/notebook/projects/new"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] transition-colors"
          >
            + New Project
          </Link>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === "all" ? "bg-[var(--primary)] text-white" : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            All ({projects.length})
          </button>
          {PROJECT_STATUSES.map(s => {
            const count = projects.filter(p => p.status === s.value).length;
            return (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === s.value ? "bg-[var(--primary)] text-white" : `${s.color} hover:opacity-80`
                }`}
              >
                {s.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((project) => {
            const color = getColor(project.color_index);
            return (
              <Link
                key={project.id}
                href={`/notebook/projects/${project.id}`}
                className={`group flex flex-col items-center justify-center gap-2 rounded-2xl ${color.bg} p-6 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] aspect-square relative`}
              >
                <span className="text-5xl font-bold tabular-nums text-white">
                  {project.row_count}
                </span>
                <span className="text-sm font-medium text-white/90 truncate max-w-full px-2">
                  {project.name}
                </span>
                {project.progress > 0 && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="w-full bg-white/30 rounded-full h-1.5">
                      <div className="bg-white rounded-full h-1.5" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={project.status} />
                </div>
              </Link>
            );
          })}

          {/* Quick Add Card */}
          {isAdding ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-md dark:bg-zinc-800 aspect-square">
              <form onSubmit={(e) => { e.preventDefault(); addProject(); }} className="flex flex-col items-center gap-3 w-full">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  autoFocus
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-center outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
                <div className="flex gap-2">
                  <button type="submit" className="rounded-full bg-[var(--primary)] px-4 py-1.5 text-sm text-white">Add</button>
                  <button type="button" onClick={() => { setIsAdding(false); setNewProjectName(""); }} className="text-sm text-zinc-500 hover:text-zinc-700">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 p-6 transition-colors hover:border-[var(--primary)] hover:bg-white/50 dark:border-zinc-600 dark:hover:border-[var(--primary)] aspect-square"
            >
              <span className="text-4xl text-zinc-400">+</span>
              <span className="text-sm text-zinc-400">Quick Add</span>
            </button>
          )}
        </div>

        {filtered.length === 0 && !isAdding && (
          <div className="mt-8 text-center">
            <p className="text-zinc-500">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
