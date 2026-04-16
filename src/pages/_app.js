import Head from "next/head";
import "@/styles/main.css";

import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { Toaster } from "sonner";

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
        <meta
          name="google-site-verification"
          content="xFeTRB7..."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Layout>
            <RouteLoader />

            <ErrorBoundary>
              {getLayout(<Component {...pageProps} />)}
              <MobileBottomBar />
            </ErrorBoundary>

            <Toaster richColors position="top-right" />
          </Layout>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
