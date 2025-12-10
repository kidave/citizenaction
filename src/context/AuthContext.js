// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Login with Google OAuth redirect (the working method)
   */
  const login = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

  const logout = async () => {
    await supabase.auth.signOut();

    // Clear all committee / user cache
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

  const value = {
    user,
    loading,
    login,
    logout,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}