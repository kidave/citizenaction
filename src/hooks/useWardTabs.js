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
  const { tab: activeWardTab = WARD_TABS.PROJECT } = router.query;

  const navigateToWardTab = (tabName) => {
    const { wardCode } = router.query;
    if (wardCode) {
      router.push(`/ward/${wardCode}/${tabName}`);
    }
  };

  return {
    activeWardTab,
    navigateToWardTab,
    WARD_TABS,
  };
};