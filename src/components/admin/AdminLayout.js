// components/admin/AdminLayout.js
import { useMediaQuery } from "react-responsive";
import styles from "styles/layout/container.module.css";
import AdminSidebar from "./AdminSidebar";
import AdminBottomBar from "./AdminBottomBar";
import { useRouter } from "next/router";

// Import admin tab components directly
import MeetingAdmin from "./tabs/MeetingAdmin";
import UpdateAdmin from "./tabs/UpdateAdmin";
import CommitteeAdmin from "./tabs/CommitteeAdmin";
import ProjectAdmin from "./tabs/ProjectAdmin";

export default function AdminLayout({ wardId, activeTab }) {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleTabChange = (tab) => {
    router.push(`/admin/${wardId}/${tab}`);
  };

  const tabComponents = {
    meeting: <MeetingAdmin wardId={wardId} />,
    update: <UpdateAdmin wardId={wardId} />,
    committee: <CommitteeAdmin wardId={wardId} />,
    project: <ProjectAdmin wardId={wardId} />,
  };

  return (
    <div className={styles.page}>
      {!isMobile && (
        <AdminSidebar 
          wardId={wardId} 
          activeTab={activeTab} 
        />
      )}
      
      <div className={styles.wardMain}>
        {tabComponents[activeTab] || <MeetingAdmin wardId={wardId} />}
      </div>

      {isMobile && (
        <AdminBottomBar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
      )}
    </div>
  );
}