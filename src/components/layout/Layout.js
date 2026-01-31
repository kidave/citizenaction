// components/layout/Layout.js
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Walking Project - Making Cities Walkable</title>
      </Head>

      <div className="min-h-screen flex flex-col overflow-x-hidden">

        {/* Fixed Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 pt-16 w-full">
          {children}
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </>
  );
}

