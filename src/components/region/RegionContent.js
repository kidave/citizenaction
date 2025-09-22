// components/region/RegionContent.js
import styles from "styles/layout/container.module.css";
import { useRegion } from "context/RegionContext";

import RegionNewsletterTab from "./tabs/RegionNewsletterTab";
import RegionMeetingTab from "./tabs/RegionMeetingTab";
import RegionUpdateTab from "./tabs/RegionUpdateTab";
import RegionProjectTab from "./tabs/RegionProjectTab";
import RegionPolicyTab from "./tabs/RegionPolicyTab";

export default function RegionContent({ activeTab }) {
  const { regionCode } = useRegion();

  const tabComponents = {
    meeting: <RegionMeetingTab regionCode={regionCode} />,
    update: <RegionUpdateTab regionCode={regionCode} />,
    project: <RegionProjectTab regionCode={regionCode} />,
    newsletter: <RegionNewsletterTab regionCode={regionCode} />,
    policy: <RegionPolicyTab regionCode={regionCode} />,
  };


  return (
    <div className={styles.wardContent}>
      {tabComponents[activeTab] || <RegionNewsletterTab />}
    </div>
  );
}