// pages/_app.js
import { Open_Sans } from "next/font/google";
import Head from "next/head";
import "styles/main.css";
import "react-phone-input-2/lib/style.css";

import { AuthProvider } from "context/AuthContext";
import { AlertProvider } from "context/AlertContext";
import GlobalAlert from "components/shared/alert/GlobalAlert";

// 🧠 React Query Imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-main",
});

// ⚙️ React Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data considered fresh for 5 min
      cacheTime: 1000 * 60 * 30, // Stored in cache for 30 min
      refetchOnWindowFocus: false, // Don't auto-refetch when switching tabs
      retry: 1, // Retry once on network error
    },
  },
});

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <Head>
        <meta
          name="google-site-verification"
          content="xFeTRB7PfCuzivu7kWdkZldq7mkRsTcEvqSiKqYxfic"
        />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AlertProvider>
            <main className={openSans.variable}>
              {getLayout(<Component {...pageProps} />)}
              <GlobalAlert /> 
            </main>
          </AlertProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;