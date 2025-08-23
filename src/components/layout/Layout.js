// components/Layout.js
import Head from "next/head";
import Header from "./Header";

export default function Layout({ children }) {

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <main className="regionContainer">
        {children}
      </main>
    </>
  );
}
