// pages/region/[regionCode]/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Layout from "components/home/Layout";
import { supabase } from "utils/supabaseClient";
import styles from "styles/layout/regions.module.css";
import { FiCalendar, FiMapPin, FiUsers, FiTrendingUp, FiBook, FiArrowRight, FiGlobe } from "react-icons/fi";

export default function RegionPage() {
  const router = useRouter();
  const { regionCode } = router.query;
  const [regionInfo, setRegionInfo] = useState(null);
  const [regionData, setRegionData] = useState({
    meetings: [],
    updates: [],
    projects: [],
    newsletters: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (regionCode) {
      fetchRegionData();
    }
  }, [regionCode]);

  const fetchRegionData = async () => {
    try {
      setLoading(true);
      
      // Fetch region info
      const { data: regionData } = await supabase
        .from("region")
        .select("*")
        .eq("code", regionCode)
        .single();

      setRegionInfo(regionData);

      // Fetch regional content
      const [
        { data: meetingsData },
        { data: updatesData },
        { data: projectsData },
        { data: newslettersData }
      ] = await Promise.all([
        supabase
          .from("region_meeting")
          .select("*")
          .eq("region_code", regionCode)
          .order("meeting_date", { ascending: false })
          .limit(5),
        
        supabase
          .from("region_update")
          .select("*")
          .eq("region_code", regionCode)
          .order("update_date", { ascending: false })
          .limit(5),
        
        supabase
          .from("region_project")
          .select("*")
          .eq("region_code", regionCode)
          .order("start_date", { ascending: false })
          .limit(5),
        
        supabase
          .from("region_newsletter")
          .select("*")
          .eq("region_code", regionCode)
          .order("issue_date", { ascending: false })
          .limit(5)
      ]);

      setRegionData({
        meetings: meetingsData || [],
        updates: updatesData || [],
        projects: projectsData || [],
        newsletters: newslettersData || []
      });
      
    } catch (error) {
      console.error("Error fetching region data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading {regionCode} region data...</p>
        </div>
      </Layout>
    );
  }

  if (!regionInfo) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <FiGlobe className={styles.errorIcon} />
          <h2>Region Not Found</h2>
          <p>The region code "{regionCode}" does not exist.</p>
          <button onClick={() => router.push('/region')} className={styles.backButton}>
            Back to Regions
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.regionPage}>
        {/* Header Section */}
        <div className={styles.regionHeader}>
          <h1>{regionInfo.name}</h1>
          <p>{regionInfo.description || `Regional updates and initiatives for ${regionInfo.name}`}</p>
          
          {/* Navigation Tabs */}
          <nav className={styles.regionTabs}>
            <button 
              className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "meetings" ? styles.active : ""}`}
              onClick={() => setActiveTab("meetings")}
            >
              Regional Meetings
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "updates" ? styles.active : ""}`}
              onClick={() => setActiveTab("updates")}
            >
              Monthly Updates
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "projects" ? styles.active : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              Regional Projects
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "newsletters" ? styles.active : ""}`}
              onClick={() => setActiveTab("newsletters")}
            >
              Newsletters
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "policies" ? styles.active : ""}`}
              onClick={() => setActiveTab("policies")}
            >
              Policy Suggestions
            </button>
          </nav>
        </div>

        {/* Content Sections */}
        <div className={styles.regionContent}>
          {activeTab === "overview" && (
            <RegionOverview regionInfo={regionInfo} data={regionData} />
          )}
          {activeTab === "meetings" && (
            <RegionMeetings meetings={regionData.meetings} regionName={regionInfo.name} />
          )}
          {activeTab === "updates" && (
            <RegionUpdates updates={regionData.updates} regionName={regionInfo.name} />
          )}
          {activeTab === "projects" && (
            <RegionProjects projects={regionData.projects} regionName={regionInfo.name} />
          )}
          {activeTab === "newsletters" && (
            <RegionNewsletters newsletters={regionData.newsletters} regionName={regionInfo.name} />
          )}
          {activeTab === "policies" && (
            <RegionPolicies regionInfo={regionInfo} />
          )}
        </div>
      </div>
    </Layout>
  );
}

// Component for Overview Tab
const RegionOverview = ({ regionInfo, data }) => (
  <div className={styles.overviewGrid}>
    <div className={styles.overviewCard}>
      <FiCalendar className={styles.overviewIcon} />
      <h3>{data.meetings.length}</h3>
      <p>Regional Meetings</p>
    </div>
    <div className={styles.overviewCard}>
      <FiTrendingUp className={styles.overviewIcon} />
      <h3>{data.updates.length}</h3>
      <p>Monthly Updates</p>
    </div>
    <div className={styles.overviewCard}>
      <FiMapPin className={styles.overviewIcon} />
      <h3>{data.projects.length}</h3>
      <p>Regional Projects</p>
    </div>
    <div className={styles.overviewCard}>
      <FiBook className={styles.overviewIcon} />
      <h3>{data.newsletters.length}</h3>
      <p>Newsletters</p>
    </div>
    
    <div className={styles.overviewText}>
      <h2>About {regionInfo.name}</h2>
      <p>
        {regionInfo.description || `Welcome to the ${regionInfo.name} regional platform. 
        This area provides comprehensive updates on regional initiatives, policy discussions, 
        and collaborative projects.`}
      </p>
      <p>
        Explore the different sections to stay informed about meetings, updates, projects, 
        and newsletters specific to this region.
      </p>
    </div>
  </div>
);

// Update other components to accept regionName prop
const RegionMeetings = ({ meetings, regionName }) => (
  <div className={styles.sectionHeader}>
    <h2>{regionName} Regional Meetings</h2>
    <div className={styles.cardGrid}>
      {meetings.length > 0 ? (
        meetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))
      ) : (
        <p className={styles.noData}>No regional meetings found for {regionName}</p>
      )}
    </div>
  </div>
);

// Create reusable card components
const MeetingCard = ({ meeting }) => (
  <motion.div className={styles.card} whileHover={{ y: -5 }}>
    <div className={styles.cardHeader}>
      <h3>{meeting.title}</h3>
      <span className={styles.date}>{formatDate(meeting.meeting_date)}</span>
    </div>
    <div className={styles.cardBody}>
      <p>{meeting.description || "No description available"}</p>
      {meeting.location && (
        <p className={styles.location}><FiMapPin /> {meeting.location}</p>
      )}
    </div>
    {meeting.minutes_url && (
      <div className={styles.cardFooter}>
        <a href={meeting.minutes_url} target="_blank" rel="noopener noreferrer" className={styles.viewMore}>
          View Minutes <FiArrowRight />
        </a>
      </div>
    )}
  </motion.div>
);

// Component for Updates Tab
const RegionUpdates = ({ updates }) => (
  <div className={styles.cardGrid}>
    {updates.length > 0 ? (
      updates.map((update) => (
        <motion.div 
          key={update.id}
          className={styles.card}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.cardHeader}>
            <h3>{update.title}</h3>
            <span className={styles.date}>
              {formatDate(update.update_date)}
            </span>
          </div>
          <div className={styles.cardBody}>
            <p>{update.description || "No description available"}</p>
            {update.policy_implications && (
              <div className={styles.section}>
                <h4>Policy Implications</h4>
                <p>{update.policy_implications}</p>
              </div>
            )}
            {update.regional_impact && (
              <div className={styles.section}>
                <h4>Regional Impact</h4>
                <p>{update.regional_impact}</p>
              </div>
            )}
          </div>
          {update.attachment_url && (
            <div className={styles.cardFooter}>
              <a 
                href={update.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewMore}
              >
                View Attachment <FiArrowRight />
              </a>
            </div>
          )}
        </motion.div>
      ))
    ) : (
      <p className={styles.noData}>No regional updates found</p>
    )}
  </div>
);

// Component for Projects Tab
const RegionProjects = ({ projects }) => (
  <div className={styles.cardGrid}>
    {projects.length > 0 ? (
      projects.map((project) => (
        <motion.div 
          key={project.id}
          className={styles.card}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.cardHeader}>
            <h3>{project.name}</h3>
            <span className={`${styles.status} ${styles[project.status]}`}>
              {project.status}
            </span>
          </div>
          <div className={styles.cardBody}>
            <p>{project.description || "No description available"}</p>
            <div className={styles.projectDetails}>
              {project.start_date && (
                <p><strong>Start:</strong> {formatDate(project.start_date)}</p>
              )}
              {project.end_date && (
                <p><strong>End:</strong> {formatDate(project.end_date)}</p>
              )}
              {project.budget && (
                <p><strong>Budget:</strong> ₹{project.budget.toLocaleString()}</p>
              )}
              {project.funding_source && (
                <p><strong>Funding:</strong> {project.funding_source}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))
    ) : (
      <p className={styles.noData}>No regional projects found</p>
    )}
  </div>
);

// Component for Newsletters Tab
const RegionNewsletters = ({ newsletters }) => (
  <div className={styles.cardGrid}>
    {newsletters.length > 0 ? (
      newsletters.map((newsletter) => (
        <motion.div 
          key={newsletter.id}
          className={styles.card}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.cardHeader}>
            <h3>{newsletter.title}</h3>
          </div>
          <div className={styles.cardBody}>
            {newsletter.embed_html ? (
              <div 
                dangerouslySetInnerHTML={{ __html: newsletter.embed_html }}
                className={styles.newsletterEmbed}
              />
            ) : newsletter.newsletter_url ? (
              <a 
                href={newsletter.newsletter_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newsletterLink}
              >
                View Newsletter
              </a>
            ) : (
              <p>No newsletter content available</p>
            )}
          </div>
        </motion.div>
      ))
    ) : (
      <p className={styles.noData}>No newsletters found</p>
    )}
  </div>
);

// Component for Policies Tab
const RegionPolicies = () => (
  <div className={styles.policiesContainer}>
    <h2>Policy Suggestions for MMR</h2>
    <div className={styles.policyList}>
      <div className={styles.policyItem}>
        <h3>Integrated Transport System</h3>
        <p>
          Develop an integrated multi-modal transport system connecting all parts of MMR 
          to reduce congestion and improve connectivity between Mumbai and its satellite cities.
        </p>
      </div>
      <div className={styles.policyItem}>
        <h3>Affordable Housing</h3>
        <p>
          Implement policies to promote affordable housing in the MMR region to address 
          the housing shortage and reduce slum proliferation.
        </p>
      </div>
      <div className={styles.policyItem}>
        <h3>Environmental Sustainability</h3>
        <p>
          Develop green belts, protect mangroves, and implement waste management policies 
          to ensure environmental sustainability in the rapidly urbanizing MMR.
        </p>
      </div>
      <div className={styles.policyItem}>
        <h3>Regional Governance</h3>
        <p>
          Establish a stronger metropolitan governance framework to coordinate planning 
          and development across municipal boundaries in the MMR.
        </p>
      </div>
    </div>
  </div>
);
// Similarly create UpdateCard, ProjectCard, NewsletterCard components...