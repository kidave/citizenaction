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
import AnnouncementAdmin from "./tabs/AnnouncementAdmin";

export default function AdminLayout({ wardCode, activeTab }) {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleTabChange = (tab) => {
    router.push(`/admin/${wardCode}/${tab}`);
  };

  const tabComponents = {
    meeting: <MeetingAdmin wardCode={wardCode} />,
    update: <UpdateAdmin wardCode={wardCode} />,
    committee: <CommitteeAdmin wardCode={wardCode} />,
    project: <ProjectAdmin wardCode={wardCode} />,
    announcement: <AnnouncementAdmin wardCode={wardCode} />,
  };

  return (
    <div className={styles.page}>
      {!isMobile && (
        <AdminSidebar 
          wardCode={wardCode} 
          activeTab={activeTab} 
        />
      )}
      
      <div className={styles.wardMain}>
        {tabComponents[activeTab] || <MeetingAdmin wardCode={wardCode} />}
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