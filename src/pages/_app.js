import { Open_Sans } from "next/font/google";
import Head from "next/head";
import "styles/main.css";
import "react-phone-input-2/lib/style.css";

import { AuthProvider } from "context/AuthContext";
import { AlertProvider } from "context/AlertContext";
import GlobalAlert from "components/shared/alert/GlobalAlert";
import Layout from "components/home/Layout";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-main",
});

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
  return (
    <>
      <Head>
        <meta name="google-site-verification" content="xFeTRB7..." />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AlertProvider>
            {/* Persistent layout applied globally */}
            <Layout>
              <main className={openSans.variable}>
                <Component {...pageProps} />
                <GlobalAlert />
              </main>
            </Layout>
          </AlertProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
