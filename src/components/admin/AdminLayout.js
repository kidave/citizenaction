// components/admin/AdminLayout.js
import { useMediaQuery } from "react-responsive";
import styles from "styles/layout/container.module.css";
import AdminSidebar from "./AdminSidebar";
import AdminBottomBar from "./AdminBottomBar";
import AdminContent from "./AdminContent";
import { useRouter } from "next/router";

export default function AdminLayout({ wardId, activeTab }) {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleTabChange = (tab) => {
    router.push(`/admin/${wardId}/${tab}`);
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
        <AdminContent 
          activeTab={activeTab} 
          wardId={wardId} 
        />
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