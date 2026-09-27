import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

const RPC_NAMES = {
  organization: {
    create: "create_governance_entity",
    update: "update_governance_entity",
    delete: "delete_governance_entity",
  },
  person: {
    create: "create_person",
    update: "update_person",
    delete: "delete_person",
  },
  position: {
    create: "create_position",
    update: "update_position",
    delete: "delete_position",
  },
};

export function useGovernanceCrud() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ entity, operation, params }) => {
      const rpc = RPC_NAMES[entity]?.[operation];
      if (!rpc) throw new Error(`Unsupported governance mutation: ${entity}/${operation}`);

      const { data, error } = await supabase.rpc(rpc, params);
      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.directoryRoot });
      if (variables.entity === "organization") {
        queryClient.invalidateQueries({ queryKey: queryKeys.governance.organizations });
      }
    },
  });

  const run = (entity, operation, params) =>
    mutation.mutateAsync({ entity, operation, params });

  return {
    createOrganization: (params) => run("organization", "create", params),
    updateOrganization: (params) => run("organization", "update", params),
    deleteOrganization: (id) =>
      run("organization", "delete", { p_entity_id: id }),
    createPerson: (params) => run("person", "create", params),
    updatePerson: (params) => run("person", "update", params),
    deletePerson: (id) => run("person", "delete", { p_person_id: id }),
    createPosition: (params) => run("position", "create", params),
    updatePosition: (params) => run("position", "update", params),
    deletePosition: (id) =>
      run("position", "delete", { p_position_id: id }),
    isPending: mutation.isPending,
  };
}
