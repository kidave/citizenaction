// pages/_app.js
import Head from "next/head";
import "styles/main.css";
import "react-phone-input-2/lib/style.css";
import "styles/components/forum.module.css";
import { AuthProvider } from "context/AuthContext";

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
      <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>
    </>
  );
}

export default MyApp;
