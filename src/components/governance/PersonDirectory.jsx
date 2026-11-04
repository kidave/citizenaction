import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernancePersonSheet from "@/components/governance/GovernancePersonSheet";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";
import ErrorState from "@/components/ui/error-state";

export default function PersonDirectory({
  geographyId = null,
  selectionMode = null,
  selectedIds = [],
  selectedId = null,
  onSelect,
  canManage = false,
  search: externalSearch,
  organizationId = null,
  currentOnly = false,
  domain = undefined,
  createRequest = null,
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const search = externalSearch ?? internalSearch;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const queryClient = useQueryClient();
  const { deletePerson: removePerson } = useGovernanceCrud();

  const query = useGovernanceDirectory({
    tab: "people",
    search,
    geographyId,
    organization¶»§q«^