"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: any;
  raw_user_meta_data?: any;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
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
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ) {
      console.warn("Supabase not configured. Using mock authentication.");
      console.warn(
        "Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      );
      setLoading(false);
      return;
    }

    // Create client-side Supabase client
    const supabase = createClient();

    // Get initial session
    const getInitialUser = async () => {
      try {
        console.log("Getting initial session...");

        // First try to get the session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log("Session check:", {
          session: !!session,
          error: sessionError,
        });

        if (session?.user) {
          console.log("Session found, setting user:", session.user.email);
          const userWithExtras = session.user as any;
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            created_at: session.user.created_at,
            user_metadata: session.user.user_metadata,
            raw_user_meta_data: userWithExtras.raw_user_meta_data,
            role: userWithExtras.role,
          });
          setLoading(false);
          return;
        }

        // If no session, try getUser as fallback
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        console.log("User check result:", {
          error,
          userId: user?.id,
        });

        if (user) {
          console.log("User found, setting user:", user.email);
          const userWithExtras = user as any;
          setUser({
            id: user.id,
            email: user.email || "",
            created_at: user.created_at,
            user_metadata: user.user_metadata,
            raw_user_meta_data: userWithExtras.raw_user_meta_data,
            role: userWithExtras.role,
          });
        } else {
          console.log("No user found");
        }
      } catch (error) {
        console.error("Error getting session:", error);
      }
      setLoading(false);
    };

    getInitialUser();

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
        console.log("Session found, setting user:", session.user.email);
        const userWithExtras = session.user as any;
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          created_at: session.user.created_at,
          user_metadata: session.user.user_metadata,
          raw_user_meta_data: userWithExtras.raw_user_meta_data,
          role: userWithExtras.role,
        });
      } else {
        console.log("No session, clearing user");
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
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
    const supabase = createClient();

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }

      // Clear user state immediately
      setUser(null);
      setLoading(false);

      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear state and redirect
      setUser(null);
      setLoading(false);
      window.location.href = "/login";
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
