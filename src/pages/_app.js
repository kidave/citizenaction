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
        <title>Citizen Action - Mumbai Sustainability Center</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Citizen Action" />
        <meta
          property="og:description"
          content="To ensure that every citizen have safe, convenient and enjoyable living."
        />
        <meta property="og:image" content="https://citizenaction.in/logo.png" />
        <meta property="og:url" content="https://citizenaction.in/" />

        {/* ===== Twitter ===== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Citizen Action" />
        <meta
          name="twitter:description"
          content="To ensure that every citizen have safe, convenient and enjoyable living."
        />
        <meta name="twitter:image" content="https://citizenaction.in/logo.png" />

        {/* Optional */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MediaProvider>
            <Layout>
              <RouteLoader />

              <ErrorBoundary>
                {getLayout(<Component {...pageProps} />)}
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
