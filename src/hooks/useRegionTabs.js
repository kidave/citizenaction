// hooks/useRegionTabs.js
import { useRouter } from "next/router";

export const REGION_TABS = {
  NEWSLETTER: "newsletter",
  MEETING: "meeting", 
  UPDATE: "update",
  PROJECT: "project",
  POLICY: "policy"
};

export function useRegionTabs() {
  const router = useRouter();
  const { regionCode, tab } = router.query;

  // Default tab
  const { tab: activeTab = REGION_TABS.NEWSLETTER } = router.query;
  

  const navigateToTab = (tabKey) => {
    if (!regionCode) return;
    router.push(
      `/region/${regionCode}/${tabKey}`, 
      undefined, 
      { shallow: true }
    );
  };

  return { activeTab, navigateToTab, regionCode };
}
