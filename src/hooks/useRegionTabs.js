// hooks/useRegionTabs.js
import { useRouter } from "next/router";

export const REGION_TABS = {
  MEETING: "meeting",
  UPDATE: "update",
  PROJECT: "project",
  NEWSLETTER: "newsletter",
};

export function useRegionTabs() {
  const router = useRouter();
  const { regionCode, tab } = router.query;

  const activeTab = tab || REGION_TABS.MEETING;

  const navigateToTab = (tabKey) => {
    router.push({
      pathname: `/region/[regionCode]`,
      query: { regionCode, tab: tabKey },
    });
  };

  return { activeTab, navigateToTab };
}
