"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

const COLORS = [
  { bg: "bg-rose-500", light: "bg-rose-100", text: "text-rose-600" },
  { bg: "bg-sky-500", light: "bg-sky-100", text: "text-sky-600" },
  { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-violet-500", light: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-600" },
  { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600" },
  { bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-600" },
  { bg: "bg-lime-500", light: "bg-lime-100", text: "text-lime-600" },
];

interface Project {
  id: string;
  name: string;
  count: number;
  color_index: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const supabase = createClient();

  // Check auth state on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch projects when user is logged in
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setProjects(data);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchProjects]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthError("Check your email to confirm your account!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProjects([]);
  };

  const addProject = async () => {
    if (!newProjectName.trim() || !user) return;
    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: newProjectName.trim(),
      count: 0,
      color_index: projects.length % COLORS.length,
    });
    if (!error) {
      setNewProjectName("");
      setIsAdding(false);
      fetchProjects();
    }
  };

  const deleteProject = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setExpandedProjectId(null);
    fetchProjects();
  };

  const updateCount = async (id: string, delta: number) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const newCount = Math.max(0, project.count + delta);

    // Optimistic update
    setProjects(projects.map((p) => (p.id === id ? { ...p, count: newCount } : p)));

    await supabase.from("projects").update({ count: newCount }).eq("id", id);
  };

  const resetCount = async (id: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, count: 0 } : p)));
    await supabase.from("projects").update({ count: 0 }).eq("id", id);
  };

  const getColor = (colorIndex: number) => COLORS[colorIndex % COLORS.length];

  const expandedProject = projects.find((p) => p.id === expandedProjectId);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  // Auth screen
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-zinc-800 dark:text-zinc-100 mb-2">
            Knitting Row Counter
          </h1>
          <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">
            Sign in to sync your projects across devices
          </p>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-rose-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-rose-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              required
              minLength={6}
            />

            {authError && (
              <p className={`text-sm text-center ${authError.includes("Check your email") ? "text-emerald-600" : "text-red-500"}`}>
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-rose-500 py-3 font-medium text-white hover:bg-rose-600 transition-colors"
            >
              {authMode === "login" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {authMode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-rose-500 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-rose-500 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Expanded full-screen view
  if (expandedProject) {
    const color = getColor(expandedProject.color_index);
    return (
      <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50">
          <button
            onClick={() => setExpandedProjectId(null)}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="font-medium">All Projects</span>
          </button>
          <button
            onClick={() => deleteProject(expandedProject.id)}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>

        {/* Counter */}
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <main className="flex flex-col items-center gap-8">
            <div className={`px-6 py-2 rounded-full ${color.bg}`}>
              <h1 className="text-2xl font-semibold text-white">
                {expandedProject.name}
              </h1>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Row
              </span>
              <span className={`text-9xl font-bold tabular-nums ${color.text} dark:text-zinc-100`}>
                {expandedProject.count}
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => updateCount(expandedProject.id, -1)}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl font-bold text-zinc-600 shadow-lg transition-transform active:scale-95 dark:bg-zinc-700 dark:text-zinc-200"
                aria-label="Decrease row count"
              >
                −
              </button>
              <button
                onClick={() => updateCount(expandedProject.id, 1)}
                className={`flex h-28 w-28 items-center justify-center rounded-full ${color.bg} text-5xl font-bold text-white shadow-lg transition-transform active:scale-95`}
                aria-label="Increase row count"
              >
                +
              </button>
            </div>

            <button
              onClick={() => resetCount(expandedProject.id)}
              className="mt-4 rounded-lg px-6 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-white/50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-200"
            >
              Reset Count
            </button>
          </main>
        </div>
      </div>
    );
  }

  // Grid view of all projects
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white/50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <h1 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200">
          Knitting Row Counter
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Sign Out
        </button>
      </div>

      {/* Projects Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {projects.map((project) => {
            const color = getColor(project.color_index);
            return (
              <button
                key={project.id}
                onClick={() => setExpandedProjectId(project.id)}
                className={`group flex flex-col items-center justify-center gap-2 rounded-2xl ${color.bg} p-6 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] aspect-square`}
              >
                <span className="text-5xl font-bold tabular-nums text-white">
                  {project.count}
                </span>
                <span className="text-sm font-medium text-white/90 truncate max-w-full px-2">
                  {project.name}
                </span>
              </button>
            );
          })}

          {/* Add Project Card */}
          {isAdding ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-md dark:bg-zinc-800 aspect-square">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addProject();
                }}
                className="flex flex-col items-center gap-3 w-full"
              >
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  autoFocus
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-center outline-none focus:border-rose-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-rose-500 px-4 py-1.5 text-sm text-white"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewProjectName("");
                    }}
                    className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 p-6 transition-colors hover:border-rose-400 hover:bg-white/50 dark:border-zinc-600 dark:hover:border-rose-400 dark:hover:bg-zinc-800/50 aspect-square"
            >
              <span className="text-4xl text-zinc-400 dark:text-zinc-500">+</span>
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                New Project
              </span>
            </button>
          )}
        </div>

        {projects.length === 0 && !isAdding && (
          <div className="mt-8 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              Click the + card to create your first project
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
