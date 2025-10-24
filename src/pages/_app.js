// pages/_app.js
import { Open_Sans } from "next/font/google";
import Head from "next/head";
import "styles/main.css";
import "react-phone-input-2/lib/style.css";

import { AuthProvider } from "context/AuthContext";
import { AuthAlertProvider } from "hooks/useAuthAlert";

// React Query Imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// cache persistence
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

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

//Persistent Caching (localStorage persistence)

if (typeof window !== "undefined") {
  const persister = createSyncStoragePersister({ storage: window.localStorage });
  persistQueryClient({ queryClient, persister });
}


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
          <AuthAlertProvider>
            <main className={openSans.variable}>
              {getLayout(<Component {...pageProps} />)}
            </main>
          </AuthAlertProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
