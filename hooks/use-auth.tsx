"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  username: string;
  email: string;
  cardsCount: number;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  loginWithVipps: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_ANON_KEY
    ) {
      console.warn("Supabase not configured. Using mock authentication.");
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
      });

      if (session?.user) {
        console.log(
          "Session found, loading user profile for:",
          session.user.email
        );
        await loadUserProfile(session.user);
      } else {
        console.log("No session, clearing user");
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Try to get user profile from database
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
        return;
      }

      // If no profile exists, create one
      if (!profile) {
        const newProfile = {
          id: supabaseUser.id,
          username:
            supabaseUser.user_metadata?.username ||
            supabaseUser.email?.split("@")[0] ||
            "user",
          email: supabaseUser.email || "",
          cards_count: 0,
          joined_at: new Date().toISOString().split("T")[0],
        };

        const { error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile);

        if (insertError) {
          console.error("Error creating profile:", insertError);
          return;
        }

        setUser({
          id: newProfile.id,
          username: newProfile.username,
          email: newProfile.email,
          cardsCount: newProfile.cards_count,
          joinedAt: newProfile.joined_at,
        });
      } else {
        setUser({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          cardsCount: profile.cards_count,
          joinedAt: profile.joined_at,
        });
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  const loginWithVipps = async () => {
    // Redirect to our custom Vipps OAuth endpoint
    const vippsAuthUrl = `/api/auth/vipps?redirect_uri=${encodeURIComponent(
      `${window.location.origin}/auth/callback`
    )}`;
    window.location.href = vippsAuthUrl;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithVipps,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
