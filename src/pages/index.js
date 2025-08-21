import Head from "next/head";
import Metrics from "../components/Metrics";
import Region from "../components/Region";
import Layout from "../components/Layout";
import About from "../components/About";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaUserPlus } from "react-icons/fa";
import styles from "../styles/layout/about.module.css";

function HomePage() {
  const [showAbout, setShowAbout] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

      <div className={`${styles.backgroundContainer} min-h-screen bg-gray-50`}>
        <div className={`${styles.contentWrapper} p-4`}>
          {!isMobile && <Metrics />}

          <About show={showAbout} onClose={() => setShowAbout(false)} />

          {!showAbout && (
            <button
              className={`${styles.showAboutBtn} fixed bottom-4 right-4 flex items-center justify-center rounded-full bg-blue-600 text-white p-3 shadow-lg hover:bg-blue-700`}
              onClick={() => setShowAbout(true)}
              aria-label="Show About"
            >
              <FaInfoCircle size={22} />
            </button>
          )}

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
