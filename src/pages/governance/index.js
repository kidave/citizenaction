import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";

export default function GovernanceIndexPage() {
  return <GovernanceDirectoryPage domain={null} />;
}

GovernanceIndexPage.getLayout = (page) => page;
