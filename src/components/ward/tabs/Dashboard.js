// components/ward/tabs/Dashboard.js
"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { MAPILLARY_CATEGORIES } from "config/mapillaryCategories";
import UnifiedDataTable from "components/ward/tabs/UnifiedDataTable";
import DetailPanel from "components/ward/tabs/DetailPanel";
import styles from "styles/tabs/dashboard.module.css";
import { useWard } from "context/WardContext";
import { useWardRoads, useWardJunctions } from "hooks/useWardData";
import { useWardMapillary } from "hooks/useWardMapillary";
import { FaRoad } from "react-icons/fa";

const UnifiedWardMap = dynamic(
  () => import("components/shared/maps/UnifiedWardMap"),
  { 
    ssr: false, 
    loading: () => <div className={styles.mapLoading}>Loading map...</div> 
  }
);

// Type conversion utility
const getItemType = (dataType) => {
  const typeMap = {
    roads: 'road',
    junctions: 'junction',
    mapillary: 'mapillary'
  };
  return typeMap[dataType] || dataType;
};

export default function UnifiedWardDashboard() {
  const { wardCode, wardInfo } = useWard();
  const { data: roads = [], loading: roadsLoading } = useWardRoads(wardCode);
  const { data: junctions = [], loading: junctionsLoading } = useWardJunctions(wardCode);
  const { data: mapillaryFeatures = [], loading: mapillaryLoading } = useWardMapillary(wardCode);

  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTable, setActiveTable] = useState('roads');

  // All layers visible by default
  const activeLayers = useMemo(() => ({
    roads: true,
    junctions: true,
    mapillary: true
  }), []);

  // All mapillary categories enabled by default
  const mapillaryFilters = useMemo(() => 
    Object.entries(MAPILLARY_CATEGORIES).flatMap(([key]) => MAPILLARY_CATEGORIES[key].values),
    []
  );

  // Handle item selection
  const handleSelectItem = useCallback((item) => {
    setSelectedItem({ 
      ...item, 
      type: getItemType(activeTable) 
    });
  }, [activeTable]);

  // Handle table tab change
  const handleTableChange = useCallback((tabKey) => {
    setActiveTable(tabKey);
    setSelectedItem(null); // Clear selection when changing tabs
  }, []);

  // Loading states
  const isLoading = roadsLoading || junctionsLoading || mapillaryLoading;

  // Table configurations
  const tableConfigs = useMemo(() => ({
    roads: {
      data: roads,
      columns: [
        { key: 'name', label: 'Road Name', width: 200 },
        { key: 'fclass', label: 'Type', width: 150, render: (item) => formatRoadType(item.fclass) },
        { key: 'total_length_kilometers', label: 'Length (km)', width: 120, 
          render: (item) => item.total_length_kilometers?.toFixed(2) || "0.00" }
      ]
    },
    junctions: {
      data: junctions,
      columns: [
        { key: 'name', label: 'Junction Name', width: 200 },
        { key: 'project', label: 'Project Status', width: 150,
          render: (item) => (
            <span className={`${styles.statusCell} ${getStatusClass(item)}`}>
              {getStatusText(item)}
            </span>
          )
        }
      ]
    },
    mapillary: {
      data: mapillaryFeatures,
      columns: [
        { key: 'object_value', label: 'Feature Type', width: 200,
          render: (item) => {
            const cat = Object.values(MAPILLARY_CATEGORIES).find(c => 
              c.values.includes(item.object_value)
            );
            return cat?.label || item.object_value;
          }
        },
        { key: 'id', label: 'Feature ID', width: 150 },
        { key: 'road_fid', label: 'Road ID', width: 120 }
      ]
    }
  }), [roads, junctions, mapillaryFeatures]);

  const getWardName = useCallback(() => {
    return wardInfo?.wardName || (wardCode ? `Ward ${wardCode}` : "Selected Ward");
  }, [wardCode, wardInfo]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading ward data...</p>
      </div>
    );
  }

  const tabs = [
    { key: 'roads', label: 'Roads', count: roads.length },
    { key: 'junctions', label: 'Junctions', count: junctions.length },
    { key: 'mapillary', label: 'Features', count: mapillaryFeatures.length }
  ];

  return (
    <div className={styles.dashboardContainer}>
      <Header wardName={getWardName()} />
      <Description />

      {/* Main Content Area */}
      <div className={styles.dashboardMain}>
        {/* Left Panel - Data Tables */}
        <div className={styles.dataPanel}>
          <div className={styles.tableTabs}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`${styles.tableTab} ${activeTable === tab.key ? styles.active : ''}`}
                onClick={() => handleTableChange(tab.key)}
              >
                {tab.label}
                <span className={styles.tabCount}>({tab.count})</span>
              </button>
            ))}
          </div>

          <div className={styles.tableContainer}>
            <UnifiedDataTable
              {...tableConfigs[activeTable]}
              dataType={activeTable}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
              getItemType={getItemType}
            />
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className={styles.mapPanel}>
          <UnifiedWardMap
            wardCode={wardCode}
            activeLayers={activeLayers}
            mapillaryFilters={mapillaryFilters}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
          />
        </div>
      </div>

      {/* Bottom Panel - Details */}
      <DetailPanel selectedItem={selectedItem} />
    </div>
  );
}

// Helper functions
function getStatusClass(junction) {
  if (!junction.project) return styles.noProject;
  return styles[junction.project.status] || '';
}

function getStatusText(junction) {
  if (!junction.project) return "No Project";
  const status = junction.project.status;
  return status ? status.replace('_', ' ') : 'No Project';
}

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

function Header({ wardName }) {
  return (
    <div className={styles.dashboardHeader}>
      <div className={styles.dashboardHeaderTopRow}>
        <FaRoad className={styles.dashboardHeaderIcon} />
        <h3 className={styles.dashboardTitle}>
          Dashboard of {wardName} Ward
        </h3>
      </div>
      <p className={styles.dashboardSubtitle}>
        The committees first step in this phase is to identify a specific
        stretch of road that requires walkability improvement.
      </p>
    </div>
  );
}

function Description() {
  return (
    <div className={styles.dashboardDescription}>
      Explore the map and table below to see routes identified to improve
      walkability and safety in your ward. Click on a road to view on the map.
    </div>
  );
}