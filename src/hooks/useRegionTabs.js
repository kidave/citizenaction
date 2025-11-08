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
  const { regionCode } = router.query;
  const { tab: activeRegionTab = REGION_TABS.MEETING } = router.query;

  const navigateToRegionTab = (regionTabName) => {
    if (regionCode) {
      router.push(`/region/${regionCode}/${regionTabName}`);
    }
  };

  return { 
    activeRegionTab, 
    navigateToRegionTab, 
    regionCode 
  };
}