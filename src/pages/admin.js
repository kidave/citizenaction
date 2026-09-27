import Head from "next/head";

import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <>
      <Head><title>Administration</title></Head>
      <AdminDashboard />
    </>
  );
}
