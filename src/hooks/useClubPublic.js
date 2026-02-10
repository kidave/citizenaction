// useClubPublic
import { useApiQuery } from "./useApiQuery";

export const useClubPublic = (community, scopeType, scopeCode) =>

  useApiQuery({
  key: ["club", community, scopeType, scopeCode],
  url: `/api/club/${community}/${scopeType}/${scopeCode}`,
  enabled: !!community && !!scopeType && !!scopeCode,
});