import Head from "next/head";
import Metrics from "../components/Metrics";
import Region from "../components/Region";
import Layout from "../components/Layout";
import About from "../components/About";
import Footer from "../components/Footer";
import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import styles from "../styles/layout/about.module.css";
import Form from "../components/Form";

function HomePage() {
  const [showAbout, setShowAbout] = useState(true);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Head>
        <title>Walking Project</title>
      </Head>
      <Metrics />
      <Form />
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
    </>
  );
}

// Wrap this page with the Layout
HomePage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default HomePage;
