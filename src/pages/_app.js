// pages/_app.js
import { Open_Sans } from "next/font/google";
import Head from "next/head";
import "styles/main.css";
import "react-phone-input-2/lib/style.css";
import "styles/components/forum.module.css";

import { AuthProvider } from "context/AuthContext";
import { WardProvider } from "context/WardContext";
import { AdminProvider } from "context/AdminContext";
import { useRouter } from "next/router";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-main",
});

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  const router = useRouter();
  const { wardId } = router.query;

  return (
    <>
      <Head>
        <meta
          name="google-site-verification"
          content="xFeTRB7PfCuzivu7kWdkZldq7mkRsTcEvqSiKqYxfic"
        />
      </Head>
      <AuthProvider>
        <WardProvider wardId={wardId}>
          <AdminProvider>
            <main className={openSans.variable}>
              {getLayout(<Component {...pageProps} />)}
            </main>
          </AdminProvider>
        </WardProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
