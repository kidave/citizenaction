// components/ward/tabs/DetailPanel.js
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FaRoad, FaMapMarkerAlt, FaCamera, FaExternalLinkAlt } from "react-icons/fa";
import { MAPILLARY_CATEGORIES } from "config/mapillaryCategories";
import styles from "styles/tabs/dashboard.module.css";
import { useWardTabs } from "hooks/useWardTabs";

export default function DetailPanel({ selectedItem }) {
  const { navigateToWardTab } = useWardTabs();

  const handleViewProject = useCallback(() => {
    navigateToWardTab('project');
  }, [navigateToWardTab]);

  if (!selectedItem) {
    return (
      <div className={styles.detailPanel}>
        <div className={styles.noSelection}>
          <FaMapMarkerAlt className={styles.noSelectionIcon} />
          <p>Select an item from the map or table to view details</p>
        </div>
      </div>
    );
  }

  const renderRoadDetails = (road) => (
    <div className={styles.detailCard}>
      <div className={styles.itemHeader}>
        <FaRoad className={styles.itemIcon} />
        <h4>Road Details</h4>
      </div>
      <div className={styles.detailGrid}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Name</span>
          <span>{road.name || "Unnamed Road"}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Type</span>
          <span>{formatRoadType(road.fclass)}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Length</span>
          <span>{road.total_length_kilometers?.toFixed(2) || "0.00"} km</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Road ID</span>
          <span>{road.fid}</span>
        </div>
      </div>
      
      {/* Road Statistics Section */}
      <div className={styles.statisticsSection}>
        <h5>Road Statistics</h5>
        <div className={styles.statisticsGrid}>
          <div className={styles.statistic}>
            <span className={styles.statisticLabel}>Pedestrian Score</span>
            <span className={styles.statisticValue}>
              {road.pedestrian_score || "N/A"}
            </span>
          </div>
          <div className={styles.statistic}>
            <span className={styles.statisticLabel}>Safety Rating</span>
            <span className={styles.statisticValue}>
              {road.safety_rating || "N/A"}
            </span>
          </div>
          <div className={styles.statistic}>
            <span className={styles.statisticLabel}>Maintenance Status</span>
            <span className={`${styles.statusBadge} ${styles[road.maintenance_status] || ''}`}>
              {road.maintenance_status || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJunctionDetails = (junction) => {
    const formatDate = (dateString) => {
      if (!dateString) return "Not specified";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const getStatusDisplay = (status) => {
      return status ? status.replace('_', ' ') : 'Unknown';
    };

    return (
      <div className={styles.detailCard}>
        <div className={styles.itemHeader}>
          <FaMapMarkerAlt className={styles.itemIcon} />
          <h4>Junction Details</h4>
        </div>
        
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Name</span>
            <span>{junction.name || "Unnamed Junction"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Junction ID</span>
            <span>{junction.fid}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Coordinates</span>
            <span>{junction.latitude?.toFixed(6)}, {junction.longitude?.toFixed(6)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Type</span>
            <span>{junction.type || "Standard"}</span>
          </div>
        </div>
        
        {/* Project connection - Same as JunctionTab */}
        {junction.project && (
          <div className={styles.projectCard}>
            <div className={styles.projectHeaderRow}>
              <h5 className={styles.projectTitle}>{junction.project.title}</h5>
              <span className={`${styles.statusBadge} ${styles[junction.project.status] || ''}`}>
                {getStatusDisplay(junction.project.status)}
              </span>
            </div>
            
            <div className={styles.projectMeta}>
              {junction.project.location && (
                <span className={styles.projectLocation}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                  </svg>
                  {junction.project.location}
                </span>
              )}
              {junction.project.start_date && (
                <span className={styles.projectDate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z" fill="currentColor"/>
                  </svg>
                  Started: {formatDate(junction.project.start_date)}
                </span>
              )}
              {junction.project.end_date && (
                <span className={styles.projectDate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z" fill="currentColor"/>
                  </svg>
                  Ended: {formatDate(junction.project.end_date)}
                </span>
              )}
            </div>

            <div className={styles.projectDescription}>
              <p>{junction.project.description || junction.project.rationale || "No description available."}</p>
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
        )}
      </div>
    );
  };

  const renderMapillaryDetails = (feature) => {
    const category = Object.values(MAPILLARY_CATEGORIES).find(cat => 
      cat.values.includes(feature.object_value)
    );
    
    return (
      <div className={styles.detailCard}>
        <div className={styles.itemHeader}>
          <FaCamera className={styles.itemIcon} />
          <h4>Infrastructure Feature</h4>
        </div>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Type</span>
            <span>{category?.label || feature.object_value}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Feature ID</span>
            <span>{feature.id}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Detected Value</span>
            <span>{feature.object_value}</span>
          </div>
          {feature.road_fid && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Associated Road</span>
              <span>Road {feature.road_fid}</span>
            </div>
          )}
        </div>
        
        {/* Placeholder for future image display */}
        <div className={styles.imagePlaceholder}>
          <FaCamera className={styles.placeholderIcon} />
          <p>Image preview will be available soon</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className={styles.detailPanel}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {selectedItem.type === 'road' && renderRoadDetails(selectedItem)}
      {selectedItem.type === 'junction' && renderJunctionDetails(selectedItem)}
      {selectedItem.type === 'mapillary' && renderMapillaryDetails(selectedItem)}
    </motion.div>
  );
}

// Helper function
function formatRoadType(type) {
  const mapping = {
    motorway: "Motorway",
    trunk: "Trunk",
    primary: "Primary",
    secondary: "Secondary",
    tertiary: "Tertiary",
    unclassified: "Unclassified",
    residential: "Residential",
    living_street: "Living Street",
    pedestrian: "Pedestrian",
    busway: "Busway",
    motorway_link: "Motorway Link",
    trunk_link: "Trunk Link",
    primary_link: "Primary Link",
    secondary_link: "Secondary Link",
    tertiary_link: "Tertiary Link",
    service: "Service",
    track: "Track",
    bridleway: "Bridleway",
    cycleway: "Cycleway",
    footway: "Footway",
    path: "Path",
    steps: "Steps",
  };
  return mapping[type] || type;
}