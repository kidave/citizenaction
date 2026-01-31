import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "lib/supabase/client";

export default function Callback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          // IMPORTANT: Wait a brief moment to ensure AuthContext has updated
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get the return URL
          const returnTo = localStorage.getItem("returnTo") || "/";
          localStorage.removeItem("returnTo");
          
          // Redirect
          router.replace(returnTo);
        } else {
          router.replace("/auth/login");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed");
        setTimeout(() => router.replace("/auth/login"), 2000);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">Error</h1>
          <p className="mt-2">{error}</p>
          <p className="mt-4 text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  );
}