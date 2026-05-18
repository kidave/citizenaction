import Head from "next/head";
import "@/styles/main.css";

import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { Toaster } from "sonner";
import { MediaProvider } from "@/context/MediaContext";
import ErrorBoundary from "@/components/system/ErrorBoundary";
import RouteLoader from "@/components/system/RouteLoader";
import MobileBottomBar from "@/components/layout/MobileBottomBar";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <Head>
        <title key="title">
          Citizen Action - Mumbai Sustainability Center
        </title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* ===== Open Graph (fallback only) ===== */}
        <meta property="og:type" content="website" key="og:type" />
        <meta property="og:title" content="Citizen Action" key="og:title" />
        <meta
          property="og:description"
          content="To ensure that every citizen have safe, convenient and enjoyable living."
          key="og:description"
        />
        <meta
          property="og:image"
          content="https://citizenaction.in/logo.png"
          key="og:image"
        />

        {/* ===== Twitter ===== */}
        <meta
          name="twitter:card"
          content="summary_large_image"
          key="twitter:card"
        />
        <meta name="twitter:title" content="Citizen Action" key="twitter:title" />
        <meta
          name="twitter:description"
          content="To ensure that every citizen have safe, convenient and enjoyable living."
          key="twitter:description"
        />
        <meta
          name="twitter:image"
          content="https://citizenaction.in/logo.png"
          key="twitter:image"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MediaProvider>
            <Layout>
              <RouteLoader />

              <ErrorBoundary>
                <main className="pb-20 md:pb-0">
                  {getLayout(<Component {...pageProps} />)}
                </main>

                <MobileBottomBar />
              </ErrorBoundary>

              <Toaster richColors position="top-right" />
            </Layout>
          </MediaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;