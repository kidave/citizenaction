import Head from "next/head";
import { useRouter } from "next/router";

import AdminSpaceApplicationReview from "@/components/admin/space/AdminSpaceApplicationReview";

export default function AdminSpaceApplicationPage() {
  const router = useRouter();

  return (
    <>
      <Head><title>Review Space Application</title></Head>
      <AdminSpaceApplicationReview id={router.query.id} />
    </>
  );
}
