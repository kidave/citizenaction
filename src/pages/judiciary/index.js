import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";

export default function JudiciaryDirectoryPage() {
  return <GovernanceDirectoryPage domain="judiciary" />;
}
JudiciaryDirectoryPage.getLayout = (page) => page;
