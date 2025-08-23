import Head from "next/head";
import Metrics from "components/home/Metrics";
import Region from "components/home/Region";
import Layout from "components/layout/Layout";
import About from "components/home/About";
import Footer from "components/layout/Footer";
import { useState, useEffect } from "react";
import styles from "styles/layout/about.module.css";

function HomePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <Head>
        <title>Walking Project – Make Your City Walkable</title>
        <meta
          name="description"
          content="Join the Walking Project to make your neighborhood more walkable, inclusive, and vibrant."
        />
        <meta property="og:title" content="Walking Project" />
        <meta
          property="og:description"
          content="Citizen-driven initiative for walkable neighborhoods."
        />
        <meta property="og:image" content="/wp_text_logo.png" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://walkingproject.vercel.app/" />
        <meta
          name="google-site-verification"
          content="xFeTRB7PfCuzivu7kWdkZldq7mkRsTcEvqSiKqYxfic"
        />
      </Head>

      <div className={styles.backgroundContainer}>
        <div className={styles.contentWrapper}>
          {!isMobile && <Metrics />}
          <About />
          <Region />
          <Footer />
        </div>
      </div>
    </>
  );
}

HomePage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default HomePage;
