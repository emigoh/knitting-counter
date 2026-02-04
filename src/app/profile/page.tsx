"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Profile } from "@/lib/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    display_name: "",
    bio: "",
    location: "",
  });
  const [stats, setStats] = useState({ projects: 0, patterns: 0, stash: 0 });

  useEffect(() => {
    if (!user) { router.push("/login"); return; }

    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setForm({
          username: data.username || "",
          display_name: data.display_name || "",
          bio: data.bio || "",
          location: data.location || "",
        });
      }
    };

    const fetchStats = async () => {
      const [p, pat, s] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("patterns").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("stash").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        projects: p.count || 0,
        patterns: pat.count || 0,
        stash: s.count || 0,
      });
    };

    fetchProfile();
    fetchStats();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      username: form.username || null,
      display_name: form.display_name || null,
      bio: form.bio || null,
      location: form.location || null,
    }).eq("id", user.id);
    if (!error) {
      setEditing(false);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Profile</h1>

        {/* Avatar & Name */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)] text-3xl font-bold text-white">
            {(profile?.display_name || user.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {profile?.display_name || user.email?.split("@")[0]}
            </h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
            {profile?.location && (
              <p className="text-xs text-zinc-400 mt-0.5">{profile.location}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
            <div className="text-2xl font-bold text-[var(--primary)]">{stats.projects}</div>
            <div className="text-xs text-zinc-500">Projects</div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
            <div className="text-2xl font-bold text-sky-600">{stats.patterns}</div>
            <div className="text-xs text-zinc-500">Patterns</div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
            <div className="text-2xl font-bold text-[var(--accent)]">{stats.stash}</div>
            <div className="text-xs text-zinc-500">Yarns</div>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && !editing && (
          <div className="mb-8 rounded-xl bg-white p-5 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-2">About</h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Edit Form */}
        {editing ? (
          <div className="rounded-xl bg-white p-6 shadow-sm border border-[var(--cream-dark)] dark:bg-zinc-800 dark:border-zinc-700">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Display Name</label>
                <input
                  value={form.display_name}
                  onChange={e => setForm({ ...form, display_name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Username</label>
                <input
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={saveProfile} className="rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]">
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="rounded-lg border border-zinc-300 px-6 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
