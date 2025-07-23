import Head from "next/head";
import Metrics from "../components/Metrics";
import Region from "../components/Region";
import Layout from "../components/Layout";
import About from "../components/About";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaUserPlus } from "react-icons/fa";
import styles from "../styles/layout/about.module.css";
import Form from "../components/Form";
import formStyles from '../styles/components/form.module.css';

function HomePage() {
  const [showAbout, setShowAbout] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only run on client side
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <Head>
        <title>Walking Project</title>
      </Head>
      <div className={styles.backgroundContainer}>
        <div className={styles.contentWrapper}>
          {!isMobile && <Metrics />}
          <Form
            show={showForm}
            onClose={() => setShowForm(false)}
          />
          {!isMobile && !showForm && (
            <button
              className={formStyles.applyFloatingBtn}
              onClick={() => setShowForm(true)}
              aria-label="Apply"
            >
              <FaUserPlus />
            </button>
          )}

          <About show={showAbout} onClose={() => setShowAbout(false)} />
          {!showAbout && (
            <button
              className={styles.showAboutBtn}
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