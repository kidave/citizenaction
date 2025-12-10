// components/Layout.js
import styles from "styles/layout/layout.module.css";
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

      <div className={styles.layout}>
        <Header />
        <div className={styles.main}>{children}</div>
        <Footer />
      </div>
    </>
  );
}
