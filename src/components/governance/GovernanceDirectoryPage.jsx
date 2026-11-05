import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GeographyFocusSelector from "@/components/geography/GeographyFocusSelector";
import GovernanceDirectoryToolbar from "@/components/governance/GovernanceDirectoryToolbar";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import PersonDirectory from "@/components/governance/PersonDirectory";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { GOVERNANCE_DIRECTORY_TABS, GOVERNANCE_DOMAINS } from "@/utils/governance";

const VALID_TABS = new Set(GOVERNANCE_DIRECTORY_TABS.map(([value]) => value));

function getTab(value) {
  const tab = Array.isArray(value) ? value[0] : value;
  return VALID_TABS.has(tab) ? tab : "organizations";
}

function getTabQuery(query, tab) {
  const nextQuery = { ...query };
  if (tab === "organizations") delete nextQuery.tab;
  else nextQuery.tab = tab;
  return nextQuery;
}

export default function GovernanceDirectoryPage({ domain = null }) {
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
    const expectedTab = nextTab === "organizations" ? undefined : nextTab;
    if (router.query.tab !== expectedTab) {
      router.replace(
        { pathname: domain ? `/${domain}` : "/governance", query: getTabQuery(router.query, nextTab) },
        undefined,
        { shallow: true },
      );
    }
  }, [router, domain]);

  const handleTabChange = (nextTab) => {
    if (!VALID_TABS.has(nextTab) || nextTab === tab) return;
    setTab(nextTab);
    setCreateRequest(null);
    router.push(
      { pathname: domain ? `/${domain}` : "/governance", query: getTabQuery(router.query, nextTab) },
      undefined,
      { shallow: true },
    );
  };

  const directoryProps = useMemo(
    () => ({ geographyId: focusGeographyId, canManage, domain }),
    [focusGeographyId, canManage, domain],
  );
  const domainLabel = GOVERNANCE_DOMAINS.find((item) => item.value === domain)?.label;

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden">
      <GovernancePageHeader
        items={domain ? [{ label: "Governance", href: "/governance" }, { label: domainLabel || "Governance" }] : [{ label: "Governance" }]}
        actions={
          <GeographyFocusSelector
            value={focusGeographyId}
            onValueChange={setFocusGeographyId}
          />
        }
      />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <nav aria-label="Governance domains" className="mb-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant={!domain ? "default" : "outline"}><Link href="/governance">Unassigned</Link></Button>
            {GOVERNANCE_DOMAINS.map((item) => (
              <Button key={item.value} asChild size="sm" variant={domain === item.value ? "default" : "outline"}>
                <Link href={`/${item.value}`}>{item.label}</Link>
              </Button>
            ))}
          </nav>
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

GovernanceDirectoryPage.getLayout = (page) => page;
