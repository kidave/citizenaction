// useCommitteePublic
import { useApiQuery } from "./useApiQuery";

export const useCommitteePublic = (community, scopeType, scopeCode) =>

  useApiQuery({
  key: ["committee", community, scopeType, scopeCode],
  url: `/api/committee/${community}/${scopeType}/${scopeCode}`,
  enabled: !!community && !!scopeType && !!scopeCode,
});