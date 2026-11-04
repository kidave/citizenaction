import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";
import { getGovernanceDirectoryPageProps } from "@/lib/governance/ssr";

export default function ExecutiveIndexPage({ initialOrganizations }) {
  return <GovernanceDirectoryPage domain="executive" initialOrganizations={initialOrganizations} />;
}

export async function getServerSideProps() {
  return getGovernanceDirectoryPageProps("executive");
}

ExecutiveIndexPage.getLayout = (page) => page;
