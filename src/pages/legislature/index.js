import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";
import { getGovernanceDirectoryPageProps } from "@/lib/governance/ssr";

export default function LegislatureIndexPage({ initialOrganizations }) {
  return <GovernanceDirectoryPage domain="legislature" initialOrganizations={initialOrganizations} />;
}

export async function getServerSideProps() {
  return getGovernanceDirectoryPageProps("legislature");
}

LegislatureIndexPage.getLayout = (page) => page;
