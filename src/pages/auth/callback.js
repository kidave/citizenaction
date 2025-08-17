// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "utils/supabaseClient";
import Spinner from "components/shared/ui/Spinner";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const completeLogin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Retrieve the path from localStorage and redirect.
        // It's important to remove the item to prevent future
        // unintended redirects.
        const returnTo = localStorage.getItem("returnTo") || "/";
        localStorage.removeItem("returnTo");
        router.replace(returnTo);
      } else {
        // If a session isn't established, send the user to the login page.
        // Also, clear the returnTo item to avoid a redirect loop.
        localStorage.removeItem("returnTo");
        router.replace("/auth");
      }
    };

    completeLogin();
  }, [router]);

  return <Spinner mode="fullscreen" />;
}
