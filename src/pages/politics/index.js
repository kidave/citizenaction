import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";
import { getGovernanceDirectoryPageProps } from "@/lib/governance/ssr";

export default function PoliticsIndexPage({ initialOrganizations }) {
  return <GovernanceDirectoryPage domain="politics" initialOrganizations={initialOrganizations} />;
}

export async function getServerSideProps() {
  return getGovernanceDirectoryPageProps("politics");
}

PoliticsIndexPage.getLayout = (page) => page;
