import Head from "next/head";

import AdminSpaceApplications from "@/components/admin/space/AdminSpaceApplications";

export default function AdminSpacePage() {
  return (
    <>
      <Head><title>Spaces — Administration</title></Head>
      <AdminSpaceApplications />
    </>
  );
}
