"use client";

import { useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
  count: number;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("knitting-projects");
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed.projects || []);
      setActiveProjectId(parsed.activeProjectId || null);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(
        "knitting-projects",
        JSON.stringify({ projects, activeProjectId })
      );
    }
  }, [projects, activeProjectId, loaded]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      count: 0,
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(newProject.id);
    setNewProjectName("");
    setIsAdding(false);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    if (activeProjectId === id) {
      setActiveProjectId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const updateCount = (delta: number) => {
    if (!activeProjectId) return;
    setProjects(
      projects.map((p) =>
        p.id === activeProjectId
          ? { ...p, count: Math.max(0, p.count + delta) }
          : p
      )
    );
  };

  const resetCount = () => {
    if (!activeProjectId) return;
    setProjects(
      projects.map((p) =>
        p.id === activeProjectId ? { ...p, count: 0 } : p
      )
    );
  };

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-pink-100 dark:from-zinc-900 dark:to-zinc-800">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-pink-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Project Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 bg-white/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setActiveProjectId(project.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              project.id === activeProjectId
                ? "bg-rose-500 text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            {project.name}
            <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
              {project.count}
            </span>
          </button>
        ))}
        {isAdding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addProject();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              autoFocus
              className="w-32 rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-full bg-rose-500 px-3 py-2 text-sm text-white"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewProjectName("");
              }}
              className="text-sm text-zinc-500"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xl text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
          >
            +
          </button>
        )}
      </div>

      {/* Counter Area */}
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        {activeProject ? (
          <main className="flex flex-col items-center gap-8">
            <h1 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-200">
              {activeProject.name}
            </h1>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Row
              </span>
              <span className="text-9xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
                {activeProject.count}
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => updateCount(-1)}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl font-bold text-zinc-600 shadow-lg transition-transform active:scale-95 dark:bg-zinc-700 dark:text-zinc-200"
                aria-label="Decrease row count"
              >
                −
              </button>
              <button
                onClick={() => updateCount(1)}
                className="flex h-28 w-28 items-center justify-center rounded-full bg-rose-500 text-5xl font-bold text-white shadow-lg transition-transform active:scale-95"
                aria-label="Increase row count"
              >
                +
              </button>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={resetCount}
                className="rounded-lg px-6 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-white/50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-200"
              >
                Reset Count
              </button>
              <button
                onClick={() => deleteProject(activeProject.id)}
                className="rounded-lg px-6 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                Delete Project
              </button>
            </div>
          </main>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              No projects yet
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="rounded-full bg-rose-500 px-6 py-3 font-medium text-white shadow-lg transition-transform active:scale-95"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
