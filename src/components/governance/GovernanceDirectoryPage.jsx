import { useMemo, useState } from "react";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GeographyFocusSelector from "@/components/geography/GeographyFocusSelector";
import GovernanceDirectoryToolbar from "@/components/governance/GovernanceDirectoryToolbar";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { GOVERNANCE_DOMAINS } from "@/utils/governance";

export default function GovernanceDirectoryPage({ domain = null }) {
  const [focusGeographyId, setFocusGeographyId] = useState(null);
  const [search, setSearch] = useState("");
  const [organizationType, setOrganizationType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [createRequest, setCreateRequest] = useState(null);
  const { data: profile } = useMyProfile();
  const canManage = profile?.role === "admin";
  const domainLabel = GOVERNANCE_DOMAINS.find((item) => item.value === domain)?.label || "Other";

  const directoryProps = useMemo(
    () => ({ geographyId: focusGeographyId, canManage, domain }),
    [focusGeographyId, canManage, domain],
  );

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden">
      <GovernancePageHeader
        items={[{ label: "Governance" }, { label: domainLabel }]}
        actions={<GeographyFocusSelector value={focusGeographyId} onValueChange={setFocusGeographyId} />}
      />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <GovernanceDirectoryToolbar
            tab="organizations"
            search={search}
            onSearchChange={setSearch}
            organizationType={organizationType}
            onOrganizationTypeChange={setOrganizationType}
            categoryId={categoryId}
            onCategoryIdChange={setCategoryId}
            organizationId="all"
            onOrganizationIdChange={() => {}}
            currentOnly={false}
            onCurrentOnlyChange={() => {}}
            canManage={canManage}
            domain={domain}
            onCreate={() => setCreateRequest({ tab: "organizations", token: Date.now() })}
          />
          <OrganizationDirectory
            {...directoryProps}
            search={search}
            type={organizationType}
            categoryId={categoryId}
            createRequest={createRequest}
          />
        </div>
      </main>
    </div>
  );
}

GovernanceDirectoryPage.getLayout = (page) => page;
