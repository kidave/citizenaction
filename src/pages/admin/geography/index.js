import Head from "next/head";

import AdminGeography from "@/components/admin/geography/AdminGeography";

export default function AdminGeographyPage() {
  return (
    <>
      <Head><title>Geography — Administration</title></Head>
      <AdminGeography />
    </>
  );
}
