import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernanceEntityModal from "@/components/governance/GovernanceEntityModal";
import GovernanceRelationDialog from "@/components/governance/GovernanceRelationDialog";
import GovernanceOrganizationSheet from "@/components/governance/GovernanceOrganizationSheet";
import GovernancePositionSheet from "@/components/governance/GovernancePositionSheet";
import GovernanceOrganizationResourceDialogs from "@/components/governance/GovernanceOrganizationResourceDialogs";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";
import ErrorState from "@/components/ui/error-state";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import { useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import { getGovernanceRoute, GOVERNANCE_TYPES, formatGovernanceFilterType } from "@/utils/governance";


export default function OrganizationDirectory({
  geographyId = null,
  selectionMode = null,
  selectedIds = [],
  selectedId = nul¶»§q«^