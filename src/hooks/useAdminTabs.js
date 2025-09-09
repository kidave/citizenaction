// hooks/useWardTabs.js
import { useRouter } from "next/router";

export const ADMIN_TABS = {
  MEETING: "meeting",
  UPDATE: "update", 
  COMMITTEE: "committee",
  PROJECT: "project",
};

export const useAdminTabs = () => {
  const router = useRouter();
  const { tab: activeTab = ADMIN_TABS.MEETING } = router.query;

  const navigateToTab = (tabName) => {
    const { wardId } = router.query;
    if (wardId) {
      router.push(`/admin/${wardId}/${tabName}`);
    }
  };

  return {
    activeTab,
    navigateToTab,
    ADMIN_TABS,
  };
};