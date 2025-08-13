// components/Layout.js
import Head from "next/head";
import Header from "./Header";
import { useState } from "react";
import Form from "./Form";

export default function Layout({ children }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <main className="regionContainer">
        {children}
        <Form show={showForm} onClose={() => setShowForm(false)} />
      </main>
    </>
  );
}
