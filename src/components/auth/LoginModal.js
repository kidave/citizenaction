// components/auth/LoginModal.jsx
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function LoginModal({
  open,
  onOpenChange,
  redirectPath,
  message = "You need to be signed in to continue",
}) {
  const { login, isDevAuth } = useAuth();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    setLoading(true);

    try {
      // Store where to return after login
      const returnTo =
        redirectPath ||
        (typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/");

      localStorage.setItem("returnTo", returnTo);

      if (isDevAuth) {
        if (!email) {
          toast.error("Please enter your email.");
          setLoading(false);
          return;
        }

        await login(email);

        toast.success("Magic link sent! Check your email.");
      } else {
        await login();
        toast.success("Redirecting to Google...");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Sign in to continue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            {message}
          </p>

          {/* DEV MODE → Email Login */}
          {isDevAuth && (
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <Button
            onClick={handleLogin}
            disabled={loading || (isDevAuth && !email)}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            {!isDevAuth && <FcGoogle size={20} />}

            {loading
              ? "Signing in..."
              : isDevAuth
              ? "Sign in with Email"
              : "Continue with Google"}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
