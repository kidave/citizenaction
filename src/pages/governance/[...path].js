import GovernanceRecordPage from "@/components/governance/GovernanceRecordPage";
import { getGovernanceProfilePageProps } from "@/lib/governance/ssr";

export default function UnassignedGovernanceRecordPage({ initialRecord }) {
  return <GovernanceRecordPage expectedDomain="unassigned" legacy initialRecord={initialRecord} />;
}

export async function getServerSideProps({ params }) {
  const segments = Array.isArray(params?.path) ? params.path : [];
  if (segments.length !== 1) return { props: {} };
  return getGovernanceProfilePageProps({ slug: segments[0], expectedDomain: "legacy" });
}
