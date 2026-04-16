// hooks/useRequireAuth.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export function useRequireAuth(redirectTo = "/auth/login") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Store current path to return after login
      if (typeof window !== "undefined") {
        localStorage.setItem("returnTo", window.location.pathname);
      }
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}