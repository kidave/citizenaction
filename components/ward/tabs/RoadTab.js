import { useState, useEffect } from 'react';
import buttonStyles from '../../../styles/components/button.module.css';
import styles from '../../../styles/layout/road.module.css';
import dynamic from 'next/dynamic';

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

  const handleRoadSelect = (road) => {
    onRoadClick(road);
  };

  // Filter roads based on active filter
  const filteredRoads = roads.filter(road => {
    if (activeFilter === 'all') return true;
    return road.layer_name === activeFilter;
  });

  // Group filtered roads by layer and fclass
  const grouped = filteredRoads.reduce((acc, road) => {
    const layer = road.layer_name || 'Other';
    const fclass = road.fclass || 'Other';
    if (!acc[layer]) acc[layer] = {};
    if (!acc[layer][fclass]) acc[layer][fclass] = [];
    acc[layer][fclass].push(road);
    return acc;
  }, {});

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

  return (
    <div className={styles.roadTabContainer}>
      <div className={styles.roadFilters}>
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
          {Object.keys(grouped).length === 0 ? (
            <p className={styles.empty}>No roads found.</p>
          ) : (
            Object.entries(grouped).map(([layer_name, fclassGroups]) => (
              <div key={layer_name} className={styles.layerGroup}>
                <div className={styles.layerHeader}>
                  <span className={styles.layerBullet} />
                  <h3 className={styles.layerTitle}>
                    {layer_name === 'major_roads' ? 'Major Roads' :
                     layer_name === 'minor_roads' ? 'Minor Roads' :
                     layer_name === 'highway_links' ? 'Highway Links' :
                     layer_name === 'small_roads' ? 'Small Roads' :
                     layer_name === 'no_cars' ? 'No Cars' : layer_name}
                  </h3>
                </div>
                <div className={styles.fclassGrid}>
                  {Object.entries(fclassGroups).map(([fclass, roadsInFclass]) => (
                    <div key={fclass} className={styles.fclassColumn}>
                      <div className={styles.fclassHeader}>
                        <span className={styles.fclassTitle}>
                          {fclass === 'motorway' ? 'Motorway' :
                           fclass === 'trunk' ? 'Trunk' :
                           fclass === 'primary' ? 'Primary' :
                           fclass === 'secondary' ? 'Secondary' :
                           fclass === 'tertiary' ? 'Tertiary' :
                           fclass === 'unclassified' ? 'Unclassified' :
                           fclass === 'residential' ? 'Residential' :
                           fclass === 'living_street' ? 'Living Street' :
                           fclass === 'pedestrian' ? 'Pedestrian' :
                           fclass === 'busway' ? 'Busway' :
                           fclass === 'motorway_link' ? 'Motorway Link' :
                           fclass === 'trunk_link' ? 'Trunk Link' :
                           fclass === 'primary_link' ? 'Primary Link' :
                           fclass === 'secondary_link' ? 'Secondary Link' :
                           fclass === 'tertiary_link' ? 'Tertiary Link' :
                           fclass === 'service' ? 'Service' :
                           fclass === 'track' ? 'Track' :
                           fclass === 'bridleway' ? 'Bridleway' :
                           fclass === 'cycleway' ? 'Cycleway' :
                           fclass === 'footway' ? 'Footway' :
                           fclass === 'path' ? 'Path' :
                           fclass === 'steps' ? 'Steps' : fclass}
                        </span>
                      </div>
                      <ul className={styles.roadListScroll}>
                        {roadsInFclass.map((road) => (
                          <li key={road.name} className={styles.roadListItem}>
                            <button
                              className={`${buttonStyles.wide} ${styles.roadButton} ${
                                selectedRoad?.name === road.name ? styles.selectedRoad : ''
                              }`}
                              onClick={() => handleRoadSelect(road)}
                            >
                              <span className={styles.roadName}>{road.name}</span>
                              <span className={styles.roadSegments}>
                                {road.segments_count} segments
                                {road.total_length_kilometers ? ` • ${road.total_length_kilometers.toFixed(2)} km` : ''}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))
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