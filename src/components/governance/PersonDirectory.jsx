import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import GovernanceCardActions from "@/components/governance/GovernanceCardActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getGovernanceHref, getGovernanceInitials, getGovernanceName } from "@/utils/governance";
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
  createRequest = null,
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const search = externalSearch ?? internalSearch;

  const [editingRecord, setEditingRecord] = useState(null);
  const queryClient = useQueryClient();
  const { deletePerson: removePerson } = useGovernanceCrud();





  const query = useGovernanceDirectory({
    tab: "people",
    search,
    geographyId,
    organizationId,
  });


  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (createRequest?.tab !== "people" || !createRequest.token) return;
    setEditingRecord(null);
    setDialogOpen(true);
  }, [createRequest?.token, createRequest?.tab]);

  const data = (Array.isArray(query.data) ? query.data : []).filter((person) => !currentOnly || (organizationId ? person.current_organization_id === organizationId : Boolean(person.current_organization_id)));
  const selectedSet = useMemo(
    () =>
      new Set(
        selectedIds.length ? selectedIds : selectedId ? [selectedId] : [],
      ),
    [selectedIds, selectedId],
  );

  const openCreate = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const openEdit = (entity) => {
    setEditingRecord(entity);
    setDialogOpen(true);
  };


  return (
    <div className="space-y-4">
      {query.isLoading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingState />
        </div>
      )}
      {query.error && (
        <ErrorState title="Unable to load people" />
      )}
      {!query.isLoading &&
        !query.error &&
        (data.length ? (
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Current organization</TableHead><TableHead className="w-12"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((entity) => {
                  const name = getGovernanceName(entity);
                  const href = getGovernanceHref({ ...entity, tab: "people" });
                  const org = entity.current_organization_name || entity.organization_name || "—";
                  const row = (
                    <TableRow key={entity.id} className={selectedSet.has(entity.id) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 rounded-md"><AvatarImage src={entity.image_url || undefined} alt={name}/><AvatarFallback className="rounded-md">{getGovernanceInitials(name)}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            {href ? <Link href={href} className="block truncate font-medium hover:underline">{name}</Link> : <span className="font-medium">{name}</span>}
                            {entity.position_name && <div className="truncate text-xs text-muted-foreground">{entity.position_name}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate text-muted-foreground">{org}</TableCell>
                      <TableCell>
                        {canManage && <GovernanceCardActions onEdit={() => openEdit(entity)} editLabel="Edit Person" onDelete={() => removePerson(entity)} entityLabel="person"><button type="button" className="sr-only">Person actions</button></GovernanceCardActions>}
                        {selectionMode && <button type="button" className="text-xs underline" onClick={() => onSelect?.(entity)}>{selectedSet.has(entity.id) ? "Selected" : "Select"}</button>}
                      </TableCell>
                    </TableRow>
                  );
                  return row;
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState title="No people found" description="Try another search." />
        ))}

      {canManage && (
        <GovernancePersonSheet
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          record={editingRecord}
          onSaved={() =>
            queryClient.invalidateQueries({
              queryKey: ["governance-directory"],
            })
          }
        />
      )}
    </div>
  );
}
