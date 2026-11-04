import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";
import { getGovernanceDirectoryPageProps } from "@/lib/governance/ssr";

export default function JudiciaryIndexPage({ initialOrganizations }) {
  return <GovernanceDirectoryPage domain="judiciary" initialOrganizations={initialOrganizations} />;
}

export async function getServerSideProps() {
  return getGovernanceDirectoryPageProps("judiciary");
}

JudiciaryIndexPage.getLayout = (page) => page;
