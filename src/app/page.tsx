"use client";

import { useState, useEffect } from "react";

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
  colorIndex: number;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("knitting-projects");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old projects without colorIndex
      const migratedProjects = (parsed.projects || []).map((p: Project, i: number) => ({
        ...p,
        colorIndex: p.colorIndex ?? i % COLORS.length,
      }));
      setProjects(migratedProjects);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("knitting-projects", JSON.stringify({ projects }));
    }
  }, [projects, loaded]);

  const expandedProject = projects.find((p) => p.id === expandedProjectId);

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      count: 0,
      colorIndex: projects.length % COLORS.length,
    };
    setProjects([...projects, newProject]);
    setNewProjectName("");
    setIsAdding(false);
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    setExpandedProjectId(null);
  };

  const updateCount = (id: string, delta: number) => {
    setProjects(
      projects.map((p) =>
        p.id === id ? { ...p, count: Math.max(0, p.count + delta) } : p
      )
    );
  };

  const resetCount = (id: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, count: 0 } : p)));
  };

  const getColor = (colorIndex: number) => COLORS[colorIndex % COLORS.length];

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-pink-100 dark:from-zinc-900 dark:to-zinc-800">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  // Expanded full-screen view
  if (expandedProject) {
    const color = getColor(expandedProject.colorIndex);
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
            {/* Yarn ball icon */}
            <div className={`w-16 h-16 rounded-full ${color.bg} flex items-center justify-center shadow-lg`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                <path d="M2 12h20"/>
              </svg>
            </div>

            <h1 className="text-3xl font-semibold text-zinc-700 dark:text-zinc-200">
              {expandedProject.name}
            </h1>

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
      <div className="border-b border-zinc-200 bg-white/50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <h1 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200">
          Knitting Row Counter
        </h1>
      </div>

      {/* Projects Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {projects.map((project) => {
            const color = getColor(project.colorIndex);
            return (
              <button
                key={project.id}
                onClick={() => setExpandedProjectId(project.id)}
                className={`group flex flex-col items-center justify-center gap-3 rounded-2xl ${color.light} dark:bg-zinc-800 p-6 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] aspect-square`}
              >
                {/* Yarn ball icon */}
                <div className={`w-12 h-12 rounded-full ${color.bg} flex items-center justify-center shadow-md`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                    <path d="M2 12h20"/>
                  </svg>
                </div>
                <span className={`text-4xl font-bold tabular-nums ${color.text} dark:text-zinc-100`}>
                  {project.count}
                </span>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-full px-2">
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
