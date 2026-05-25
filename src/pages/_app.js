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