// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const returnTo = localStorage.getItem("returnTo") || "/";
        localStorage.removeItem("returnTo");
        router.replace(returnTo);
      } else {
        router.replace("/auth/login");
      }
    };

    handleSession();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  );
}
