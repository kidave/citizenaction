// components/auth/GoogleOneTap.js
import { useEffect } from "react";
import { useAuth } from "context/AuthContext";

export default function GoogleOneTap() {
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("[OneTap] User already logged in → skipping One Tap");
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("[OneTap] Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    const init = () => {
      if (!window.google || !window.google.accounts?.id) {
        console.warn("[OneTap] Google script not ready yet");
        return false;
      }

      console.log("[OneTap] Initializing Google One Tap…");
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          await login(response.credential);
        },
        ux_mode: "popup", // ensures popup behavior
      });

      // Show the floating "Continue as…" prompt
      window.google.accounts.id.prompt();

      // Render inline button (fallback if popup is dismissed)
      const div = document.getElementById("googleOneTapDiv");
      if (div) {
        window.google.accounts.id.renderButton(div, {
          theme: "outline",
          size: "large",
          text: "continue_with",
        });
        console.log("[OneTap] Inline button rendered");
      }

      return true;
    };

    if (!init()) {
      const interval = setInterval(() => {
        if (init()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [login, user]);

  if (user) return null;

  return <div id="googleOneTapDiv" />;
}
