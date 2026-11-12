// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

const AuthContext = createContext();

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

function sanitizeNextPath(value) {
  if (!value || typeof value !== "string") return "/";

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    return url.pathname + url.search + url.hash || "/";
  } catch {
    return "/";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email = null, nextPath = "/") => {
    const safeNextPath = sanitizeNextPath(nextPath);

    if (DEV_MODE) {
      if (!email) throw new Error("Email required for local login");

      return supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            window.location.origin +
            "/auth/callback?next=" +
            encodeURIComponent(safeNextPath),
        },
      });
    }

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          window.location.origin +
          "/auth/callback?next=" +
          encodeURIComponent(safeNextPath),
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();

    try {
      localStorage.removeItem("userStatus");
    } catch {
      // Storage may be disabled by browser settings.
    }

    queryClient.removeQueries({ queryKey: queryKeys.auth.userStatus });
    setUser(null);
  };

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getAccessToken,
        isDevAuth: DEV_MODE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
