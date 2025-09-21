// components/region/RegionLayout.js
import { useState } from "react";
import styles from "styles/layout/region.module.css";
import RegionSidebar from "./RegionSidebar";
import RegionContent from "./RegionContent";

export default function RegionLayout() {
  const [activeTab, setActiveTab] = useState("newsletter");

  return (
    <div className={styles.regionLayout}>
      <div className={styles.sidebarContainer}>
        <RegionSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className={styles.contentContainer}>
        <RegionContent activeTab={activeTab} />
      </div>
    </div>
  );
}