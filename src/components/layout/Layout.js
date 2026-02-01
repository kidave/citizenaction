// components/layout/Layout.js
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Citizen Action</title>
      </Head>

      <div className="min-h-screen overflow-x-hidden">

        {/* Fixed Header */}
        <header className="fixed top-0 inset-x-0 z-50 h-[var(--header-height)]">
          <Header />
        </header>

        {/* Page Content */}
        <main
          className="w-full"
          style={{ paddingTop: "var(--header-height)" }}
        >
          {children}
        </main>

        {/* Footer (scroll-only, NOT part of viewport math) */}
        <Footer />

      </div>
    </>
  );
}
