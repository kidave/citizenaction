import Head from "next/head";

import AdminGovernanceChanges from "@/components/admin/governance/AdminGovernanceChanges";

export default function AdminGovernancePage() {
  return (
    <>
      <Head><title>Governance — Administration</title></Head>
      <AdminGovernanceChanges />
    </>
  );
}
