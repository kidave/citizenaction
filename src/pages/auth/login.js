import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function Auth() {
  const router = useRouter();
  const { user, login, isDevAuth } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      const returnTo = localStorage.getItem("returnTo") || "/";
      localStorage.removeItem("returnTo");
      router.replace(returnTo);
    }
  }, [user, router]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/";

      if (currentPath !== "/auth/login") {
        localStorage.setItem("returnTo", currentPath);
      }

      await login(email);
    } catch (err) {
      setError(err.message || "Failed to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative space-y-2 text-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-2 top-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

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

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {isDevAuth ? (
            <>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleLogin}
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? "Sending link…" : "Sign in with Email"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="flex w-full items-center gap-2"
              variant="outline"
            >
              <FcGoogle size={20} />
              {loading ? "Signing in…" : "Continue with Google"}
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/auth/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            Mumbai Sustainability Centre © 2024
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
