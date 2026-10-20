import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GeographyFocusSelector from "@/components/geography/GeographyFocusSelector";
import GovernanceDirectoryToolbar from "@/components/governance/GovernanceDirectoryToolbar";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import PersonDirectory from "@/components/governance/PersonDirectory";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { GOVERNANCE_DIRECTORY_TABS } from "@/utils/governance";

const VALID_TABS = new Set(GOVERNANCE_DIRECTORY_TABS.map(([value]) => value));

function getTab(value) {
  const tab = Array.isArray(value) ? value[0] : value;
  return VALID_TABS.has(tab) ? tab : "organizations";
}

export default function GovernancePage() {
  const router = useRouter();
  const [tab, setTab] = useState("organizations");
  const [focusGeographyId, setFocusGeographyId] = useState(null);
  const [search, setSearch] = useState("");
  const [organizationType, setOrganizationType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [organizationId, setOrganizationId] = useState("all");
  const [currentOnly, setCurrentOnly] = useState(false);
  const [createRequest, setCreateRequest] = useState(null);
  const { data: profile } = useMyProfile();
  const canManage = profile?.role === "admin";

  useEffect(() => {
    if (!router.isReady) return;

    const nextTab = getTab(router.query.tab);
    setTab(nextTab);

    if (router.query.tab !== nextTab) {
      router.replace(
        { pathname: "/governance", query: { ...router.query, tab: nextTab } },
        undefined,
        { shallow: true },
      );
    }
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (nextTab) => {
    if (!VALID_TABS.has(nextTab) || nextTab === tab) return;
    setTab(nextTab);
    setCreateRequest(null);
    router.push(
      { pathname: "/governance", query: { ...router.query, tab: nextTab } },
      undefined,
      { shallow: true },
    );
  };

  const directoryProps = useMemo(
    () => ({ geographyId: focusGeographyId, canManage }),
    [focusGeographyId, canManage],
  );

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden">
      <GovernancePageHeader
        items={[{ label: "Governance" }]}
        actions={
          <GeographyFocusSelector
            value={focusGeographyId}
            onValueChange={setFocusGeographyId}
          />
        }
      />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <GovernanceDirectoryToolbar
            tab={tab}
            tabs={
              <Tabs value={tab} onValueChange={handleTabChange}>
                <TabsList className="w-max max-w-full">
                  {GOVERNANCE_DIRECTORY_TABS.map(([value, label]) => (
                    <TabsTrigger key={value} value={value} className="px-3 sm:px-4">
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            }
            search={search} onSearchChange={setSearch}
            organizationType={organizationType} onOrganizationTypeChange={setOrganizationType}
            categoryId={categoryId} onCategoryIdChange={setCategoryId}
            organizationId={organizationId} onOrganizationIdChange={setOrganizationId}
            currentOnly={currentOnly} onCurrentOnlyChange={setCurrentOnly}
            canManage={canManage}
            onCreate={() => setCreateRequest({ tab, token: Date.now() })}
          />

          {tab === "organizations" && (
            <OrganizationDirectory {...directoryProps} search={search} type={organizationType} categoryId={categoryId} createRequest={createRequest} />
          )}
          {tab === "people" && <PersonDirectory {...directoryProps} search={search} organizationId={organizationId === "all" ? null : organizationId} currentOnly={currentOnly} createRequest={createRequest} />}
        </div>
      </main>
    </div>
  );
}

GovernancePage.getLayout = (page) => page;
