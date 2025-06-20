import { useState, useEffect } from 'react';
import buttonStyles from '../../../styles/components/button.module.css';
import styles from '../../../styles/layout/road.module.css';
import dynamic from 'next/dynamic';
import { Table, TableHeader, TableCell } from '../../shared';
import { FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from 'react-icons/fi';

const RoadMap = dynamic(
  () => import('./RoadMap'),
  { 
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Loading map...</div>
  }
);

// Updated road filters based on your layer structure
const ROAD_FILTERS = [
  { id: 'all', label: 'All Roads' },
  { id: 'major_roads', label: 'Major Roads' },       // layer_id 5110
  { id: 'minor_roads', label: 'Minor Roads' },       // layer_id 5120
  { id: 'highway_links', label: 'Highway Links' },   // layer_id 5130
  { id: 'small_roads', label: 'Small Roads' },       // layer_id 5140
  { id: 'no_cars', label: 'No Cars' }                // layer_id 5150
];

export default function RoadTab({ roads, onRoadClick, selectedRoad, wardInfo }) {
  const MUMBAI_CENTER = [19.0760, 72.8777];
  const DEFAULT_ZOOM = 12;
  const [activeFilter, setActiveFilter] = useState('major_roads');
  const [wardBoundary, setWardBoundary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleRoadSelect = (road) => {
    onRoadClick(road);
  };

  // Filter roads based on active filter
  const filteredRoads = roads.filter(road => {
    if (activeFilter === 'all') return true;
    return road.layer_name === activeFilter;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRoads.length / itemsPerPage));
  const paginatedRoads = filteredRoads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

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
    <div className={styles.roadTabContainer}>
      <div className={styles.filterButtons}>
        {ROAD_FILTERS.map(filter => (
          <button
            key={filter.id}
            className={`${styles.filterButton} ${activeFilter === filter.id ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      <div className={styles.roadContent}>
        <div className={styles.roadListSection}>
          {filteredRoads.length === 0 ? (
            <p className={styles.empty}>No roads found.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <Table className={styles.table}>
                <thead>
                  <tr>
                    <TableHeader width={200}>Road Name</TableHeader>
                    <TableHeader width={150}>Type</TableHeader>
                    <TableHeader width={150}>Category</TableHeader>
                    <TableHeader width={120}>Length (km)</TableHeader>
                    <TableHeader width={100}>Segments</TableHeader>
                    <TableHeader width={100}>Actions</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoads.map((road) => (
                    <tr key={road.name} className={selectedRoad?.name === road.name ? styles.selectedRow : ''}>
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
                      <TableCell>
                        {road.layer_name === 'major_roads' ? 'Major Roads' :
                         road.layer_name === 'minor_roads' ? 'Minor Roads' :
                         road.layer_name === 'highway_links' ? 'Highway Links' :
                         road.layer_name === 'small_roads' ? 'Small Roads' :
                         road.layer_name === 'no_cars' ? 'No Cars' : road.layer_name}
                      </TableCell>
                      <TableCell>{road.total_length_kilometers?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{road.segments_count}</TableCell>
                      <TableCell>
                        <button
                          className={buttonStyles.wide}
                          onClick={() => handleRoadSelect(road)}
                        >
                          View
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
            roads={filteredRoads} 
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