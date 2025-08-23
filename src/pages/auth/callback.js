// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "utils/supabaseClient";
import Spinner from "components/shared/ui/Spinner";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const completeLogin = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // Retrieve the stored path and redirect
          const returnTo = localStorage.getItem("returnTo") || "/";
          localStorage.removeItem("returnTo"); // Clean up
          router.replace(returnTo);
        } else {
          // If no session, redirect to auth page
          router.replace("/auth");
        }
      } catch (err) {
        console.error("Callback error:", err);
        router.replace("/auth");
      }
    };

    completeLogin();
  }, [router]);

  return <Spinner mode="fullscreen" />;
}