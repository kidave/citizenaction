// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/client";

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

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const handleSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        router.replace("/auth/login");
        return;
      }

      const next = sanitizeNextPath(
        typeof router.query.next === "string" ? router.query.next : "/"
      );

      router.replace(next);
    };

    handleSession();
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  );
}
