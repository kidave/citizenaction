// components/Layout.js
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import styles from "styles/layout/layout.module.css";

export default function Layout({ children, showHeader = true, showFooter = true }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Walking Project - Making Cities Walkable</title>
      </Head>
      <div className={styles.layout}>
        {showHeader && <Header />}
        <main className={styles.main}>
          {children}
        </main>
        {showFooter && <Footer />}
      </div>
    </>
  );
}