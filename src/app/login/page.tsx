"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push("/");
    return null;
  }

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
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <svg width="56" height="56" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="12" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
            <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M11 14c0-1.7 1.3-3 3-3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <line x1="14" y1="2" x2="14" y2="6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <h1 className="text-3xl font-bold text-[var(--primary)]">unravel</h1>
          <p className="text-center text-sm text-zinc-500">
            where every stitch tells a story
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
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
            className="w-full rounded-lg bg-[var(--primary)] py-3 font-medium text-white hover:bg-[var(--primary-dark)] transition-colors"
          >
            {authMode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          {authMode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setAuthMode("signup")}
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setAuthMode("login")}
                className="text-[var(--primary)] hover:underline font-medium"
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
