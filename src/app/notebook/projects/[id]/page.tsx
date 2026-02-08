"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Project, StashYarn } from "@/lib/types";
import { PROJECT_COLORS, PROJECT_STATUSES, CRAFT_TYPES, YARN_WEIGHTS } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import HappinessRating from "@/components/HappinessRating";

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [stashYarns, setStashYarns] = useState<StashYarn[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [showCounter, setShowCounter] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
  }, [user]);

  const fetchProject = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
    if (data) {
      setProject(data);
      setEditForm(data);
    }
  }, [user, projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  // Fetch stash for yarn linking
  useEffect(() => {
    if (!user) return;
    supabase.from("stash").select("*").then(({ data }) => {
      if (data) setStashYarns(data);
    });
  }, [user]);

  // Real-time for this project
  useEffect(() => {
    if (!user || !projectId) return;
    const channel = supabase
      .channel(`project-${projectId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "projects",
        filter: `id=eq.${projectId}`
      }, (payload) => {
        setProject(payload.new as Project);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, projectId]);

  const updateCount = async (delta: number) => {
    if (!project) return;
    const newCount = Math.max(0, project.row_count + delta);
    setProject({ ...project, row_count: newCount });
    await supabase.from("projects").update({ row_count: newCount }).eq("id", project.id);
  };

  const resetCount = async () => {
    if (!project) return;
    setProject({ ...project, row_count: 0 });
    await supabase.from("projects").update({ row_count: 0 }).eq("id", project.id);
  };

  const saveProject = async () => {
    if (!project) return;
    const { error } = await supabase.from("projects").update({
      name: editForm.name,
      status: editForm.status,
      craft: editForm.craft,
      pattern_name: editForm.pattern_name,
      needle_size: editForm.needle_size,
      gauge: editForm.gauge,
      started_at: editForm.started_at,
      completed_at: editForm.completed_at,
      notes: editForm.notes,
      progress: editForm.progress,
      made_for: editForm.made_for,
      happiness: editForm.happiness,
      yarn_id: editForm.yarn_id,
    }).eq("id", project.id);
    if (!error) {
      setEditing(false);
      fetchProject();
    }
  };

  const deleteProject = async () => {
    if (!project) return;
    await supabase.from("projects").delete().eq("id", project.id);
    router.push("/notebook/projects");
  };

  if (!user || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  const color = PROJECT_COLORS[project.color_index % PROJECT_COLORS.length];

  // Full-screen Row Counter Mode
  if (showCounter) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--cream)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--cream-dark)] bg-white/50">
          <button
            onClick={() => setShowCounter(false)}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="font-medium">Back to Project</span>
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <main className="flex flex-col items-center gap-8">
            <div className={`px-6 py-2 rounded-full bg-[var(--cream)] border-2 ${color.border}`}>
              <h1 className={`text-2xl font-semibold ${color.text}`}>{project.name}</h1>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm uppercase tracking-wide text-zinc-500">Row</span>
              <span className={`text-9xl font-bold tabular-nums ${color.text} dark:text-zinc-100`}>
                {project.row_count}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => updateCount(-1)}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl font-bold text-zinc-600 shadow-lg transition-transform active:scale-95 dark:bg-zinc-700 dark:text-zinc-200"
                aria-label="Decrease row count"
              >
                -
              </button>
              <button
                onClick={() => updateCount(1)}
                className={`flex h-28 w-28 items-center justify-center rounded-full ${color.bg} text-5xl font-bold text-white shadow-lg transition-transform active:scale-95`}
                aria-label="Increase row count"
              >
                +
              </button>
            </div>
            <button
              onClick={resetCount}
              className="mt-4 rounded-lg px-6 py-2 text-sm font-medium text-zinc-500 hover:bg-white/50 hover:text-zinc-700 transition-colors"
            >
              Reset Count
            </button>
          </main>
        </div>
      </div>
    );
  }

  // Project Detail View
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/notebook/projects" className="hover:text-[var(--primary)]">Projects</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--cream)] border-2 ${color.border} text-2xl font-bold ${color.text}`}>
              {project.row_count}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={project.status} />
                <span className="text-xs text-zinc-500 capitalize">{project.craft}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCounter(true)}
              className={`rounded-lg border-2 ${color.border} px-4 py-2 text-sm font-medium ${color.text} hover:bg-zinc-50 transition-all`}
            >
              Row Counter
            </button>
            <button
              onClick={() => setEditing(!editing)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors dark:border-zinc-600 dark:text-zinc-300"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500">Progress</span>
            <span className="text-xs font-medium text-zinc-600">{project.progress}%</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
            <div className={`${color.bg} rounded-full h-2 transition-all`} style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {editing ? (
          /* Edit Form */
          <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Name</label>
                <input
                  value={editForm.name || ""}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Status</label>
                <select
                  value={editForm.status || "in_progress"}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value as Project["status"] })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                >
                  {PROJECT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Craft</label>
                <select
                  value={editForm.craft || "knitting"}
                  onChange={e => setEditForm({ ...editForm, craft: e.target.value as Project["craft"] })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                >
                  {CRAFT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Pattern Name</label>
                <input
                  value={editForm.pattern_name || ""}
                  onChange={e => setEditForm({ ...editForm, pattern_name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Needle/Hook Size</label>
                <input
                  value={editForm.needle_size || ""}
                  onChange={e => setEditForm({ ...editForm, needle_size: e.target.value })}
                  placeholder="e.g., US 7 / 4.5mm"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Gauge</label>
                <input
                  value={editForm.gauge || ""}
                  onChange={e => setEditForm({ ...editForm, gauge: e.target.value })}
                  placeholder="e.g., 20 sts x 26 rows = 4 in"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Made For</label>
                <input
                  value={editForm.made_for || ""}
                  onChange={e => setEditForm({ ...editForm, made_for: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Yarn from Stash</label>
                <select
                  value={editForm.yarn_id || ""}
                  onChange={e => setEditForm({ ...editForm, yarn_id: e.target.value || null })}
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
                  value={editForm.started_at || ""}
                  onChange={e => setEditForm({ ...editForm, started_at: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Completed</label>
                <input
                  type="date"
                  value={editForm.completed_at || ""}
                  onChange={e => setEditForm({ ...editForm, completed_at: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Progress ({editForm.progress || 0}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editForm.progress || 0}
                  onChange={e => setEditForm({ ...editForm, progress: parseInt(e.target.value) })}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Happiness</label>
                <HappinessRating value={editForm.happiness || 0} onChange={v => setEditForm({ ...editForm, happiness: v })} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Notes</label>
              <textarea
                value={editForm.notes || ""}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={saveProject} className="rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]">
                Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-zinc-300 px-6 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300">
                Cancel
              </button>
              <button onClick={deleteProject} className="ml-auto rounded-lg px-6 py-2 text-sm text-red-500 hover:bg-red-50">
                Delete Project
              </button>
            </div>
          </div>
        ) : (
          /* Read-only View */
          <div className="space-y-6">
            {/* Quick Row Counter */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Row Counter</h2>
                <button
                  onClick={() => setShowCounter(true)}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  Full Screen
                </button>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => updateCount(-1)}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-600 shadow transition-transform active:scale-95 dark:bg-zinc-700 dark:text-zinc-200"
                >
                  -
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-zinc-400 uppercase">Row</span>
                  <span className={`text-6xl font-bold tabular-nums ${color.text}`}>{project.row_count}</span>
                </div>
                <button
                  onClick={() => updateCount(1)}
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${color.bg} text-2xl font-bold text-white shadow transition-transform active:scale-95`}
                >
                  +
                </button>
              </div>
              <div className="flex justify-center mt-3">
                <button onClick={resetCount} className="text-xs text-zinc-400 hover:text-zinc-600">Reset</button>
              </div>
            </div>

            {/* Project Details */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {project.craft && (
                  <div><span className="text-zinc-400">Craft</span><p className="font-medium capitalize">{project.craft}</p></div>
                )}
                {project.pattern_name && (
                  <div><span className="text-zinc-400">Pattern</span><p className="font-medium">{project.pattern_name}</p></div>
                )}
                {project.needle_size && (
                  <div><span className="text-zinc-400">Needle/Hook</span><p className="font-medium">{project.needle_size}</p></div>
                )}
                {project.gauge && (
                  <div><span className="text-zinc-400">Gauge</span><p className="font-medium">{project.gauge}</p></div>
                )}
                {project.made_for && (
                  <div><span className="text-zinc-400">Made For</span><p className="font-medium">{project.made_for}</p></div>
                )}
                {project.started_at && (
                  <div><span className="text-zinc-400">Started</span><p className="font-medium">{new Date(project.started_at).toLocaleDateString()}</p></div>
                )}
                {project.completed_at && (
                  <div><span className="text-zinc-400">Completed</span><p className="font-medium">{new Date(project.completed_at).toLocaleDateString()}</p></div>
                )}
                {project.happiness > 0 && (
                  <div>
                    <span className="text-zinc-400">Happiness</span>
                    <div className="mt-1"><HappinessRating value={project.happiness} readonly /></div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="rounded-xl bg-white p-6 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Notes</h2>
                <p className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{project.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
