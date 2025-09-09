import { useState, useEffect } from "react";
import headerStyles from "styles/layout/junction.module.css";
import styles from "styles/layout/road.module.css";
import dynamic from "next/dynamic";
import { Table, TableHeader, TableCell } from "components/shared/table";
import { FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from "react-icons/fi";
import { FaRoad } from "react-icons/fa";
import { useWard } from "context/WardContext";
import useWardRoads from "hooks/useWardRoads";

const RoadMap = dynamic(() => import("./RoadMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading map...</div>,
});

export default function RoadTab() {
  const { wardId, wardInfo } = useWard();
  const { roads, loading: roadsLoading, error: roadsError } = useWardRoads(wardId);
  const MUMBAI_CENTER = [19.076, 72.8777];
  const DEFAULT_ZOOM = 12;
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [wardBoundary, setWardBoundary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    return () => {
      // This will clean up when user navigates away from this tab
      setSelectedRoad(null);
    };
  }, []);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil((roads?.length || 0) / itemsPerPage));
  const paginatedRoads = roads?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  ) || [];

  // Fetch ward boundary
  useEffect(() => {
    if (!wardInfo?.wardId) return;

    const fetchWardBoundary = async () => {
      try {
        const response = await fetch(`/api/ward-boundary?wardId=${wardInfo.wardId}`);
        const data = await response.json();
        setWardBoundary(data.geometry);
      } catch (error) {
        console.error("Error fetching ward boundary:", error);
      }
    };

    fetchWardBoundary();
  }, [wardInfo?.wardId]);

  // Pagination controls
  const handlePageInput = (e) => {
    let val = Number(e.target.value);
    if (isNaN(val)) return;
    if (val < 1) val = 1;
    if (val > totalPages) val = totalPages;
    setCurrentPage(val);
  };

  if (roadsLoading) return <p>Loading roads...</p>;
  if (roadsError) return <p>Error loading roads: {roadsError.message}</p>;

  return (
    <div className={styles.roadContainer}>
      <Header roadCount={roads?.length || 0} wardName={wardInfo?.wardName} />
      <Description />

      <div className={styles.roadContent}>
        <div className={styles.roadListSection}>
          {!roads || roads.length === 0 ? (
            <p className={styles.empty}>No roads found.</p>
          ) : (
            <div className={styles.tableWrapper}>
              {/* --- Table --- */}
              <Table className={styles.table}>
                <thead>
                  <tr>
                    <TableHeader width={200}>Road Name</TableHeader>
                    <TableHeader width={150}>Type</TableHeader>
                    <TableHeader width={120}>Length (km)</TableHeader>
                    <TableHeader width={100}>Actions</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoads.map((road) => (
                    <tr
                      key={road.fid}
                      className={selectedRoad?.fid === road.fid ? styles.selectedRow : ""}
                    >
                      <TableCell>{road.name || "Unnamed"}</TableCell>
                      <TableCell>
                        <span className={styles.typeTag}>{formatRoadType(road.fclass)}</span>
                      </TableCell>
                      <TableCell>
                        {road.total_length_kilometers?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setSelectedRoad(road)}
                          className={headerStyles.viewButton}
                        >
                          {selectedRoad?.fid === road.fid ? "Viewing" : "View"}
                        </button>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* --- Pagination --- */}
              <div className={styles.pagination}>
                <span
                  className={`${styles.arrow} ${currentPage === 1 ? styles.disabled : ""}`}
                  onClick={() => currentPage > 1 && setCurrentPage(1)}
                  title="First Page"
                >
                  <FiChevronsLeft />
                </span>
                <span
                  className={`${styles.arrow} ${currentPage === 1 ? styles.disabled : ""}`}
                  onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
                  title="Previous Page"
                >
                  <FiChevronLeft />
                </span>
                <span className={styles.pageInputWrapper}>
                  <span className={styles.pageInputLabel}>Page</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={handlePageInput}
                    className={styles.pageInput}
                  />
                  <span className={styles.pageInputLabel}>of</span>
                  <span className={styles.pageInputNumber}>{totalPages}</span>
                </span>
                <span
                  className={`${styles.arrow} ${currentPage === totalPages ? styles.disabled : ""}`}
                  onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
                  title="Next Page"
                >
                  <FiChevronRight />
                </span>
                <span
                  className={`${styles.arrow} ${currentPage === totalPages ? styles.disabled : ""}`}
                  onClick={() => currentPage < totalPages && setCurrentPage(totalPages)}
                  title="Last Page"
                >
                  <FiChevronsRight />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.roadMapSection}>
          <RoadMap
            roads={roads}
            selectedRoad={selectedRoad}
            onRoadSelect={setSelectedRoad}
            center={MUMBAI_CENTER}
            zoom={DEFAULT_ZOOM}
          />
        </div>
      </div>
    </div>
  );
}

// 🛠️ Helper to clean up road type rendering
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

// Header Component
function Header({ roadCount, wardName }) {
  return (
    <div className={headerStyles.junctionHeader}>
      <FaRoad className={headerStyles.junctionHeaderIcon} />
      <div>
        <h3 className={headerStyles.junctionTitle}>
          {roadCount} Roads in {wardName} Ward
        </h3>
        <p className={headerStyles.junctionSubtitle}>
          The committees first step in this phase is to identify a specific
          stretch of road that requires walkability improvement.
        </p>
      </div>
    </div>
  );
}

// Description Component
function Description() {
  return (
    <div className={headerStyles.junctionDescription}>
      Explore the map and table below to see routes identified to improve
      walkability and safety in your ward. Click on a road to view on the map.
    </div>
  );
}
