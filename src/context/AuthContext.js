// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "utils/supabaseClient";

const AuthContext = createContext();

// Role constants for better maintainability
export const USER_ROLES = {
  CONVENOR: 1,
  CO_CONVENOR: 2,
  MEMBER: 3,
  PUBLIC: 'public'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchProfileAndRole = async (userId) => {
    try {
      if (!userId) return { profile: null, role: USER_ROLES.PUBLIC };

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      // Fetch role from committee table
      const { data: committeeData, error: committeeError } = await supabase
        .from("committee")
        .select("role_id")
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle to handle no rows

      if (committeeError && committeeError.code !== "PGRST116") {
        console.error("Committee fetch error:", committeeError);
        throw committeeError;
      }

      return {
        profile: profileData || null,
        role: committeeData?.role_id || USER_ROLES.PUBLIC
      };
    } catch (err) {
      console.error("Fetch error:", err);
      return { profile: null, role: USER_ROLES.PUBLIC };
    }
  };

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  };

  useEffect(() => {
    const handleAuthStateChange = async (session) => {
      setLoading(true);
      setError(null);
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const { profile, role } = await fetchProfileAndRole(currentUser.id);
          setProfile(profile);
          setUserRole(role);
        } catch (err) {
          console.error("Auth state change error:", err);
          setError("Failed to load user data");
          setProfile(null);
          setUserRole(USER_ROLES.PUBLIC);
        }
      } else {
        setProfile(null);
        setUserRole(USER_ROLES.PUBLIC);
      }
      setLoading(false);
    };

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => handleAuthStateChange(session))
      .catch((err) => {
        console.error("Initial auth error:", err);
        setError("Authentication error");
        setLoading(false);
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthStateChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Role checking methods
  const hasRole = (requiredRole) => {
    return userRole === requiredRole;
  };

  const isConvenor = () => hasRole(USER_ROLES.CONVENOR);
  const isCoConvenor = () => hasRole(USER_ROLES.CO_CONVENOR);
  const isMember = () => hasRole(USER_ROLES.MEMBER);
  const isPublic = () => !userRole || userRole === USER_ROLES.PUBLIC;

  const hasAnyRole = (...roles) => {
    return roles.includes(userRole);
  };

  const hasAtLeastRole = (minRole) => {
    if (isPublic()) return false;
    return userRole <= minRole; // Lower number = higher privilege
  };

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      // Store the current path for redirect after login
      if (!localStorage.getItem("returnTo")) {
        localStorage.setItem("returnTo", router.asPath);
      }
      
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed");
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Store the current path for potential redirect after logout
      localStorage.setItem("postLogoutRedirect", router.asPath);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setUserRole(USER_ROLES.PUBLIC);
      // Redirect to home after logout
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfileAndRole = async () => {
    if (user) {
      try {
        const { profile: newProfile, role: newRole } = await fetchProfileAndRole(user.id);
        setProfile(newProfile);
        setUserRole(newRole);
        return { profile: newProfile, role: newRole };
      } catch (err) {
        console.error("Refresh error:", err);
        setError("Failed to refresh user data");
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    profile,
    userRole,
    loading,
    error,
    login,
    logout,
    refreshProfileAndRole, // Renamed for clarity
    getAccessToken,
    // Role methods
    hasRole,
    hasAnyRole,
    hasAtLeastRole,
    isConvenor,
    isCoConvenor,
    isMember,
    isPublic,
    // Role constants for external use
    USER_ROLES
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}