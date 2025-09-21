// components/region/RegionContent.js
import styles from "styles/layout/region.module.css";
import RegionNewsletterTab from "./tabs/RegionNewsletterTab";
import RegionMeetingTab from "./tabs/RegionMeetingTab";
import RegionUpdateTab from "./tabs/RegionUpdateTab";
import RegionProjectTab from "./tabs/RegionProjectTab";
import RegionPolicyTab from "./tabs/RegionPolicyTab";

export default function RegionContent({ activeTab }) {
  const tabComponents = {
    newsletter: <RegionNewsletterTab />,
    meeting: <RegionMeetingTab />,
    update: <RegionUpdateTab />,
    project: <RegionProjectTab />,
    policy: <RegionPolicyTab />,
  };

  return (
    <div className={styles.regionContent}>
      {tabComponents[activeTab] || <RegionNewsletterTab />}
    </div>
  );
}