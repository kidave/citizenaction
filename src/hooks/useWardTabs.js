// hooks/useWardTabs.js
import { useRouter } from "next/router";

export const WARD_TABS = {
  MEETING: "meeting",
  UPDATE: "update", 
  COMMITTEE: "committee",
  PROJECT: "project",
  ROAD: "road",
  JUNCTION: "junction",
  ACTION: "action",
};

export const useWardTabs = () => {
  const router = useRouter();
  const { tab: activeTab = WARD_TABS.MEETING } = router.query;

  const navigateToTab = (tabName) => {
    const { wardId } = router.query;
    if (wardId) {
      router.push(`/ward/${wardId}/${tabName}`);
    }
  };

  return {
    activeTab,
    navigateToTab,
    WARD_TABS,
  };
};