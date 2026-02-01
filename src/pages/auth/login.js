import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { useAuth } from "context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function Auth() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const returnTo = localStorage.getItem("returnTo") || "/";
      localStorage.removeItem("returnTo");
      router.replace(returnTo);
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Always save current path before redirecting to OAuth
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        // Only save if not already on login page
        if (currentPath !== "/auth/login") {
          localStorage.setItem("returnTo", currentPath);
        }
      }

      await login();
      // Note: The redirect happens via OAuth, so we don't need to handle it here
    } catch (err) {
      setError(err.message || "Failed to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <Card className="w-full max-w-md">

        {/* HEADER */}
        <CardHeader className="relative text-center space-y-2">

          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-2 top-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/wp_icon_sm.avif"
              alt="Logo"
              width={32} 
              height={32}
              className="h-10 w-auto"
            />
            <Image
              src="/wp_text_logo.avif"
              alt="Walking Project"
              width={128} 
              height={128}
              className="h-8 w-auto"
            />
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <FcGoogle size={20} />
            {loading ? "Signing in…" : "Continue with Google"}
          </Button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By continuing, you agree to our{" "}
            <Link
              href="/auth/privacy"
              className="underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            Mumbai Sustainability Centre © 2024
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
