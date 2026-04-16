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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  );
}
