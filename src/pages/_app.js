// pages/_app.js
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import "styles/main.css";
import "react-phone-input-2/lib/style.css";
import "styles/components/forum.module.css";
import { AuthProvider } from "context/AuthContext";


const nunito = Nunito_Sans({
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
        <main className={nunito.variable}>
          {getLayout(<Component {...pageProps} />)}
        </main>
      </AuthProvider>
    </>
  );
}

export default MyApp;
