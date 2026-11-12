import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export function useRequireAuth(redirectTo = "/auth/login") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || user || !router.isReady) return;

    const nextPath = router.asPath || "/";

    router.replace({
      pathname: redirectTo,
      query:
        redirectTo === "/auth/login" && nextPath !== "/auth/login"
          ? { next: nextPath }
          : {},
    });
  }, [loading, user, router, redirectTo]);

  return { user, loading };
}
