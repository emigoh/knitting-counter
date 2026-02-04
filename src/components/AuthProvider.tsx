"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import Navbar from "./Navbar";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <div className="flex flex-col items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
            <circle cx="14" cy="14" r="12" stroke="var(--primary-light)" strokeWidth="2.5" fill="none"/>
            <path d="M8 14c0-3.3 2.7-6 6-6" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </svg>
          <span className="text-sm text-[var(--primary-light)]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {user && <Navbar user={user} />}
      {children}
    </AuthContext.Provider>
  );
}
