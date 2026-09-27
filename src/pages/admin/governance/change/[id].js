import Head from "next/head";
import { useRouter } from "next/router";

import AdminGovernanceChangeReview from "@/components/admin/governance/AdminGovernanceChangeReview";

export default function AdminGovernanceChangePage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head><title>Review Governance Change</title></Head>
      <AdminGovernanceChangeReview id={id} />
    </>
  );
}
