import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Building2, Landmark, Scale, Vote } from "lucide-react";
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
const DOMAIN_ICONS = {
  politics: Vote,
  legislature: Landmark,
  executive: Building2,
  judiciary: Scale,
};

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

export default function GovernanceDirectoryPage({ domain = "unassigned", initialOrganizations = [] }) {
  const router = useRouter();
  const [tab, setTab¶»§q«^