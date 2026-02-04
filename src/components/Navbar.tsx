"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notebookRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notebookRef.current && !notebookRef.current.contains(e.target as Node)) {
        setNotebookOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname.startsWith(path);

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--cream-dark)] bg-[var(--cream)] shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="12" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
            <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M11 14c0-1.7 1.3-3 3-3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <line x1="14" y1="2" x2="14" y2="6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-xl font-bold text-[var(--primary)]">unravel</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {/* My Notebook Dropdown */}
          <div ref={notebookRef} className="relative">
            <button
              onClick={() => {
                setNotebookOpen(!notebookOpen);
                setUserMenuOpen(false);
              }}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/notebook")
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--foreground)] hover:bg-[var(--cream-dark)]"
              }`}
            >
              my notebook
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
            {notebookOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-[var(--cream-dark)] bg-white py-1 shadow-lg dark:bg-zinc-800 dark:border-zinc-700">
                <Link
                  href="/notebook/projects"
                  onClick={() => setNotebookOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-[var(--cream-dark)] dark:hover:bg-zinc-700"
                >
                  Projects
                </Link>
                <Link
                  href="/notebook/stash"
                  onClick={() => setNotebookOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-[var(--cream-dark)] dark:hover:bg-zinc-700"
                >
                  Stash
                </Link>
                <Link
                  href="/notebook/queue"
                  onClick={() => setNotebookOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-[var(--cream-dark)] dark:hover:bg-zinc-700"
                >
                  Queue
                </Link>
                <Link
                  href="/notebook/favorites"
                  onClick={() => setNotebookOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-[var(--cream-dark)] dark:hover:bg-zinc-700"
                >
                  Favorites
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/patterns"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/patterns")
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground)] hover:bg-[var(--cream-dark)]"
            }`}
          >
            patterns
          </Link>

          <Link
            href="/notebook/stash"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/notebook/stash"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground)] hover:bg-[var(--cream-dark)]"
            }`}
          >
            yarns
          </Link>
        </div>

        {/* User Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotebookOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--cream-dark)] transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden sm:inline max-w-[120px] truncate">{user.email}</span>
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-[var(--cream-dark)] bg-white py-1 shadow-lg dark:bg-zinc-800 dark:border-zinc-700">
              <Link
                href="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-[var(--cream-dark)] dark:hover:bg-zinc-700"
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUserMenuOpen(false);
                  window.location.href = "/login";
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-[var(--cream-dark)] dark:hover:bg-zinc-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
