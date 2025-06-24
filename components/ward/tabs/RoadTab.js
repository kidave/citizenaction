import { useState, useEffect } from 'react';
import headerStyles from '../../../styles/layout/junction.module.css';
import styles from '../../../styles/layout/road.module.css';
import dynamic from 'next/dynamic';
import { Table, TableHeader, TableCell } from '../../shared';
import { FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from 'react-icons/fi';
import { FaRoad } from "react-icons/fa";
import { useWard } from '../../../src/context/WardContext';

const RoadMap = dynamic(
  () => import('./RoadMap'),
  { 
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Loading map...</div>
  }
);

export default function RoadTab({ roads, onRoadClick, selectedRoad }) {
  const { wardInfo } = useWard();
  const MUMBAI_CENTER = [19.0760, 72.8777];
  const DEFAULT_ZOOM = 12;
  const [wardBoundary, setWardBoundary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleRoadSelect = (road) => {
    onRoadClick(road);
  };

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(roads.length / itemsPerPage));
  const paginatedRoads = roads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch ward boundary
  useEffect(() => {
    if (!wardInfo?.wardId) return;
    
    const fetchWardBoundary = async () => {
      try {
        const response = await fetch(`/api/ward-boundary?wardId=${wardInfo.wardId}`);
        const data = await response.json();
        setWardBoundary(data.geometry);
      } catch (error) {
        console.error('Error fetching ward boundary:', error);
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

  return (
    <div className={styles.roadContainer}>
      <Header 
        roadCount={roads?.length || 0} 
        wardName={wardInfo?.wardName} 
      />
      <Description />
      
      <div className={styles.roadContent}>
        <div className={styles.roadListSection}>
          {roads.length === 0 ? (
            <p className={styles.empty}>No roads found.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <Table className={styles.table}>
                <thead>
                  <tr>
                    <TableHeader width={200}>Road Name</TableHeader>
                    <TableHeader width={150}>Type</TableHeader>
                    <TableHeader width={120}>Length (km)</TableHeader>
                    <TableHeader width={100}>Segments</TableHeader>
                    <TableHeader width={100}>Actions</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoads.map((road) => (
                    <tr key={road.fid} className={selectedRoad?.fid === road.fid ? styles.selectedRow : ''}>
                      <TableCell>{road.name || 'Unnamed'}</TableCell>
                      <TableCell>
                        <span className={styles.typeTag}>
                          {road.fclass === 'motorway' ? 'Motorway' :
                           road.fclass === 'trunk' ? 'Trunk' :
                           road.fclass === 'primary' ? 'Primary' :
                           road.fclass === 'secondary' ? 'Secondary' :
                           road.fclass === 'tertiary' ? 'Tertiary' :
                           road.fclass === 'unclassified' ? 'Unclassified' :
                           road.fclass === 'residential' ? 'Residential' :
                           road.fclass === 'living_street' ? 'Living Street' :
                           road.fclass === 'pedestrian' ? 'Pedestrian' :
                           road.fclass === 'busway' ? 'Busway' :
                           road.fclass === 'motorway_link' ? 'Motorway Link' :
                           road.fclass === 'trunk_link' ? 'Trunk Link' :
                           road.fclass === 'primary_link' ? 'Primary Link' :
                           road.fclass === 'secondary_link' ? 'Secondary Link' :
                           road.fclass === 'tertiary_link' ? 'Tertiary Link' :
                           road.fclass === 'service' ? 'Service' :
                           road.fclass === 'track' ? 'Track' :
                           road.fclass === 'bridleway' ? 'Bridleway' :
                           road.fclass === 'cycleway' ? 'Cycleway' :
                           road.fclass === 'footway' ? 'Footway' :
                           road.fclass === 'path' ? 'Path' :
                           road.fclass === 'steps' ? 'Steps' : road.fclass}
                        </span>
                      </TableCell>
                      <TableCell>{road.total_length_kilometers?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{road.segments_count}</TableCell>
                      <TableCell>
                        <button 
                          onClick={() => handleRoadSelect(road)}
                          className={headerStyles.viewButton}
                        >
                          {selectedRoad?.fid === road.fid ? 'Viewing' : 'View'}
                        </button>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className={styles.pagination}>
                <span
                  className={`${styles.arrow} ${currentPage === 1 ? styles.disabled : ''}`}
                  onClick={() => currentPage > 1 && setCurrentPage(1)}
                  title="First Page"
                  aria-disabled={currentPage === 1}
                >
                  <FiChevronsLeft />
                </span>
                <span
                  className={`${styles.arrow} ${currentPage === 1 ? styles.disabled : ''}`}
                  onClick={() => currentPage > 1 && setCurrentPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                  aria-disabled={currentPage === 1}
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
                  className={`${styles.arrow} ${currentPage === totalPages ? styles.disabled : ''}`}
                  onClick={() => currentPage < totalPages && setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  title="Next Page"
                  aria-disabled={currentPage === totalPages}
                >
                  <FiChevronRight />
                </span>
                <span
                  className={`${styles.arrow} ${currentPage === totalPages ? styles.disabled : ''}`}
                  onClick={() => currentPage < totalPages && setCurrentPage(totalPages)}
                  title="Last Page"
                  aria-disabled={currentPage === totalPages}
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
            onRoadSelect={handleRoadSelect}
            center={MUMBAI_CENTER}
            zoom={DEFAULT_ZOOM}
            wardBoundary={wardBoundary}
          />
        </div>
      </div>
    </div>
  );
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
          The committees first step in this phase is to identify a specific stretch of road that requires walkability improvement.
        </p>
      </div>
    </div>
  );
}

// Description Component
function Description() {
  return (
    <div className={headerStyles.junctionDescription}>
      Explore the map and table below to see routes identified to improve walkability and safety in your ward. 
      Click on a road to view on the map.
    </div>
  );
}