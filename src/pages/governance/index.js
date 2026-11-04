import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";
import { getGovernanceDirectoryPageProps } from "@/lib/governance/ssr";

export default function GovernanceIndexPage({ initialOrganizations }) {
  return <GovernanceDirectoryPage domain="unassigned" initialOrganizations={initialOrganizations} />;
}

export async function getServerSideProps() {
  return getGovernanceDirectoryPageProps("unassigned");
}

GovernanceIndexPage.getLayout = (page) => page;
