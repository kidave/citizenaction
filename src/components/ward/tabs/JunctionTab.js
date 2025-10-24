"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "styles/tabs/junction.module.css";
import { FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";
import { useWard } from "context/WardContext";
import { useProjectJunctions } from "hooks/useProjectJunctions";
import { Table, TableHeader, TableCell } from "components/shared/table";
import { useWardTabs } from "hooks/useWardTabs";

const JunctionMap = dynamic(() => import("./JunctionMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading map...</div>,
});

export default function JunctionTab() {
  const { wardId } = useWard();
  const { data: junctions, loading, error } = useProjectJunctions(wardId);
  const [selectedJunction, setSelectedJunction] = useState(null);

  // Reset selection when ward changes
  useEffect(() => {
    setSelectedJunction(null);
  }, [wardId]);

  const getWardName = () => {
    return wardId ? `Ward ${wardId}` : "Selected Ward";
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed"
    };
    return statusMap[status] || status;
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderContent = () => {
    if (loading) {
      return <div className={styles.loading}>Loading junction data...</div>;
    }

    if (error) {
      return <div className={styles.error}>Error loading junctions: {error.message}</div>;
    }

    return (
      <>
        <TopSection
          junctions={junctions}
          selectedJunction={selectedJunction}
          onSelectJunction={setSelectedJunction}
          wardId={wardId}
        />

        {selectedJunction && (
          <BottomSection
            junction={selectedJunction}
            getStatusDisplay={getStatusDisplay}
            formatDate={formatDate}
          />
        )}
      </>
    );
  };

  return (
    <div className={styles.junctionContainer}>
      <Header
        junctionCount={junctions?.length || 0}
        wardName={getWardName()}
      />
      <Description />
      {renderContent()}
    </div>
  );
}

// Header Components (similar to ProjectTab)
function Header({ junctionCount, wardName }) {
  return (
    <div className={styles.junctionHeader}>
      <div className={styles.junctionHeaderTopRow}>
        <FaMapMarkerAlt className={styles.junctionHeaderIcon} />
        <h3 className={styles.junctionTitle}>
          Identified {junctionCount} Junctions in {wardName}
        </h3>
      </div>
      <p className={styles.junctionSubtitle}>
        Each intersection represents a critical point for pedestrian movement
        and traffic flow in your ward. Click on a junction to view details and associated projects.
      </p>
    </div>
  );
}

function Description() {
  return (
    <div className={styles.junctionDescription}>
      Explore the map and table below to see identified junctions, their
      suggested design, and associated projects. Click on any row to view more
      information.
    </div>
  );
}

function TopSection({ junctions, selectedJunction, onSelectJunction, wardId }) {
  const MUMBAI_CENTER = [19.076, 72.8777];
  const DEFAULT_ZOOM = 12;

  const handleRowClick = (junction) => {
    onSelectJunction(junction);
  };

  const getStatusClass = (junction) => {
    if (!junction.project) return styles.noProject;
    return styles[junction.project.status] || '';
  };

  const getStatusText = (junction) => {
    if (!junction.project) return "No Project";
    const status = junction.project.status;
    return status ? status.replace('_', ' ') : 'No Project';
  };

  return (
    <div className={styles.junctionContent}>
      <div className={styles.junctionListSection}>
        {junctions?.length > 0 ? (
          <div className={styles.junctionTable}>
            <Table className={styles.table}>
              <thead>
                <tr>
                  <TableHeader width={200}>Junction Name</TableHeader>
                  <TableHeader width={120}>Project Status</TableHeader>
                </tr>
              </thead>
              <tbody>
                {junctions.map((junction) => {
                  const isSelected = selectedJunction?.fid === junction.fid;
                  
                  return (
                    <tr
                      key={junction.fid}
                      className={`${styles.clickableRow} ${
                        isSelected ? styles.selectedRow : ""
                      }`}
                      onClick={() => handleRowClick(junction)}
                    >
                      <TableCell>
                        <div className={styles.junctionName}>
                          {junction.name || "Unnamed"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`${styles.statusCell} ${getStatusClass(junction)}`}>
                          {getStatusText(junction)}
                        </div>
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className={styles.noData}>No junction data available</div>
        )}
      </div>

      <div className={styles.junctionMapSection}>
        <JunctionMap
          junctions={junctions}
          selectedJunction={selectedJunction}
          onJunctionSelect={onSelectJunction}
          center={MUMBAI_CENTER}
          zoom={DEFAULT_ZOOM}
          wardId={wardId}
        />
      </div>
    </div>
  );
}

function BottomSection({ junction, getStatusDisplay, formatDate }) {
  return (
    <motion.div
      className={styles.bottomSection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <JunctionDetails junction={junction} />
      {junction.project && (
        <ProjectConnection project={junction.project} getStatusDisplay={getStatusDisplay} formatDate={formatDate} />
      )}
    </motion.div>
  );
}

function JunctionDetails({ junction }) {
  return (
      <div className={styles.detailCard}>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Junction ID</span>
            <span>{junction.fid}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Junction Name</span>
            <span>{junction.name || "Unnamed Junction"}</span>
          </div>
        </div>
      </div>
  );
}

function ProjectConnection({ project, getStatusDisplay, formatDate }) {
  const { navigateToTab } = useWardTabs();

  const handleViewProject = () => {
    navigateToTab('project');
  };

  return (
      <div className={styles.projectCard}>
        <div className={styles.projectHeaderRow}>
          <h5 className={styles.projectTitle}>{project.title}</h5>
          <span className={`${styles.statusBadge} ${styles[project.status]}`}>
            {getStatusDisplay(project.status)}
          </span>
        </div>
        
        <div className={styles.projectMeta}>
          {project.location && (
            <span className={styles.projectLocation}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
              </svg>
              {project.location}
            </span>
          )}
          {project.start_date && (
            <span className={styles.projectDate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z" fill="currentColor"/>
              </svg>
              Started: {formatDate(project.start_date)}
            </span>
          )}
          {project.end_date && (
            <span className={styles.projectDate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z" fill="currentColor"/>
              </svg>
              Ended: {formatDate(project.end_date)}
            </span>
          )}
        </div>

        <div className={styles.projectDescription}>
          <p>{project.description || project.rationale || "No description available."}</p>
        </div>

        <div className={styles.projectActions}>
          <button 
            className={styles.viewProjectButton}
            onClick={handleViewProject}
          >
            View Full Project Details
            <FaExternalLinkAlt />
          </button>
        </div>
      </div>
  );
}