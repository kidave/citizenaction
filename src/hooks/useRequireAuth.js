import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export function useRequireAuth(redirectTo = "/auth/login") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || user) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("returnTo", router.asPath);
    }

    router.replace(redirectTo);
  }, [loading, user, router, redirectTo]);

  return { user, loading };
}
