// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
   * Normal login with Google OAuth redirect
   */
  const loginWithRedirect = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

  /**
   * One Tap login (exchange Google ID token directly)
   */
  const loginWithIdToken = async (googleJwt) => {
    if (!googleJwt) throw new Error("Missing Google ID token");
    return supabase.auth.signInWithIdToken({
      provider: "google",
      token: googleJwt,
    });
  };

  /**
   * Unified login function:
   * - If called with token → One Tap flow
   * - Else → Redirect flow
   */
  const login = (googleJwt) => {
    if (googleJwt) {
      return loginWithIdToken(googleJwt);
    }
    return loginWithRedirect();
  };

  const logout = () => supabase.auth.signOut();

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const value = {
    user,
    loading,
    login, // handles both redirect + One Tap
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
