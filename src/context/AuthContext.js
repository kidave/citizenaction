// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext();

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Universal login
   * - Local → Email OTP
   * - Production → Google OAuth
   */
  const login = async (email = null) => {
    if (DEV_MODE) {
      if (!email) throw new Error("Email required for local login");

      return supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    }

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();

    localStorage.removeItem("userStatus");
    queryClient.removeQueries({ queryKey: ["userStatus"] });

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
