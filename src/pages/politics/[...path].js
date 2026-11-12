import GovernanceRecordPage from "@/components/governance/GovernanceRecordPage";
import { getGovernanceProfileRouteProps } from "@/lib/governance/domainRouting";

export default function PoliticsGovernanceRecordPage() {
  return <GovernanceRecordPage expectedDomain="politics" />;
}
export async function getServerSideProps(context) {
  const segments = Array.isArray(context.params?.path) ? context.params.path : [];
  if (segments.length !== 1) return { notFound: true };
  return getGovernanceProfileRouteProps({ slug: segments[0], expectedDomain: "politics", query: context.query });
}
