import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Playfair_Display } from "next/font/google";
import "@/styles/main.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Layout from "@/components/layout/Layout";
import ErrorBoundary from "@/components/system/ErrorBoundary";
import RouteLoader from "@/components/system/RouteLoader";
import AppProviders from "@/components/system/AppProviders";

const GoogleOneTap = dynamic(() => import("@/components/auth/GoogleOneTap"), {
  ssr: false,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    const splash = document.getElementById("app-splash");
    if (!splash) return;

    splash.classList.add("is-hidden");
    const timeoutId = window.setTimeout(() => splash.remove(), 220);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className={playfair.variable}>
      <Head>
        <title key="title">Citizen Action - Mumbai Sustainability Center</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Citizen Action" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppProviders>
        <GoogleOneTap />
        <Layout>
          <RouteLoader />
          <ErrorBoundary>
            <main className="w-full min-w-0">
              {getLayout(<Component {...pageProps} />)}
            </main>
          </ErrorBoundary>
        </Layout>
      </AppProviders>

      <Analytics mode="production" />
      <SpeedInsights />
    </div>
  );
}

export default MyApp;
