// pages/_app.js
import { Open_Sans } from "next/font/google";
import Head from "next/head";
import "styles/main.css";
import "react-phone-input-2/lib/style.css";

import { AuthProvider } from "context/AuthContext";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-main",
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
      <AuthProvider>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
        <main className={openSans.variable}>
          {getLayout(<Component {...pageProps} />)}
        </main>
      </AuthProvider>
    </>
  );
}

export default MyApp;
