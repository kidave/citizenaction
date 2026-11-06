import GovernanceRecordPage from "@/components/governance/GovernanceRecordPage";
import { getGovernanceProfileRouteProps } from "@/lib/governance/domainRouting";

export default function UnassignedGovernanceRecordPage() {
  return <GovernanceRecordPage expectedDomain={null} />;
}

export async function getServerSideProps(context) {
  const segments = Array.isArray(context.params?.path) ? context.params.path : [];
  if (segments.length !== 1) return { props: {} };
  return getGovernanceProfileRouteProps({
    slug: segments[0],
    expectedDomain: "legacy",
    query: context.query,
  });
}
