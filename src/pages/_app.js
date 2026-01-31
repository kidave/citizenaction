// pages/_app.js
import { Open_Sans } from "next/font/google";
import Head from "next/head";

// Global styles
import "styles/main.css";
import "react-phone-input-2/lib/style.css";

// Contexts
import { AuthProvider } from "context/AuthContext";
import { AlertProvider } from "context/AlertContext";

// Alerts & UI
/* import GlobalAlert from "components/shared/alert/GlobalAlert"; */
import { Toaster } from "sonner";

// Layout
import Layout from "components/layout/Layout";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-main",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min
      cacheTime: 30 * 60 * 1000,  // 30 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Citizen Action - Mumbai Sustainability Center</title>
        <meta
          name="google-site-verification"
          content="xFeTRB7..."
        />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AlertProvider>
            
            {/* Global Toasts */}
            

            {/* Persistent site layout */}
            <Layout>
              <main className={openSans.variable}>
                <Component {...pageProps} />
                <Toaster richColors position="top-right" />
              </main>
            </Layout>

          </AlertProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
