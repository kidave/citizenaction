"use client";

import { useCallback, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/client";

function generateNonce() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...randomBytes));
}

async function hashNonce(nonce) {
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function GoogleOneTap() {
  const router = useRouter();
  const shouldSkip = router.pathname === "/auth/login" || router.pathname === "/auth/callback" || router.pathname === "/auth/privacy";

  const initializeOneTap = useCallback(async () => {
    if (shouldSkip) return;
    if (!window.google?.accounts?.id) {
      console.warn("Google Identity Services is not available yet.");
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      if (process.env.NODE_ENV !== "production") console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return;

      const nonce = generateNonce();
      const hashedNonce = await hashNonce(nonce);

      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: hashedNonce,
        callback: async (response) => {
          try {
            if (!response?.credential) {
              console.warn("Google One Tap returned no credential.");
              return;
            }
            const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: response.credential, nonce });
            if (error && process.env.NODE_ENV !== "production") {
              console.error("Google One Tap sign-in failed", { message: error.message, code: error.code });
            }
          } catch (error) {
            if (process.env.NODE_ENV !== "production") console.error("Google One Tap authentication failed", { message: error?.message });
          }
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification?.isSkippedMoment?.()) console.info("Google One Tap was skipped.");
        if (notification?.isDismissedMoment?.()) console.info("Google One Tap was dismissed.", { reason: notification.getDismissedReason?.() });
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to initialize Google One Tap", { message: error?.message });
    }
  }, [shouldSkip]);

  useEffect(() => {
    if (shouldSkip) {
      window.google?.accounts?.id?.cancel();
      return;
    }
    if (window.google?.accounts?.id) initializeOneTap();
    return () => window.google?.accounts?.id?.cancel();
  }, [initializeOneTap, shouldSkip]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={initializeOneTap}
      onError={() => {
        if (process.env.NODE_ENV !== "production") console.error("Failed to load Google Identity Services.");
      }}
    />
  );
}
