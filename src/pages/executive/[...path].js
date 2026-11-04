import GovernanceRecordPage from "@/components/governance/GovernanceRecordPage";
import { getGovernanceProfilePageProps } from "@/lib/governance/ssr";

export default function ExecutiveGovernanceRecordPage({ initialRecord }) {
  return <GovernanceRecordPage expectedDomain="executive" initialRecord={initialRecord} />;
}

export async function getServerSideProps({ params }) {
  const segments = Array.isArray(params?.path) ? params.path : [];
  if (segments.length !== 1) return { notFound: true };
  return getGovernanceProfilePageProps({ slug: segments[0], expectedDomain: "executive" });
}
