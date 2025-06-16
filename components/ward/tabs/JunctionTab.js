'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../../styles/layout/junction.module.css';

const JunctionMap = dynamic(
  () => import('./JunctionMap'),
  { 
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Loading map...</div>
  }
);

export default function JunctionTab({ junctions }) {
  const [selectedJunction, setSelectedJunction] = useState(null);

  const MUMBAI_CENTER = [19.0760, 72.8777];
  const DEFAULT_ZOOM = 12;

  useEffect(() => {
    setSelectedJunction(null);
  }, [junctions]);

  return (
    <div className={styles.junctionContainer}>
      
      {junctions === undefined ? (
        <div className={styles.loading}>Loading junction data...</div>
      ) : (
        <div className={styles.mainContent}>
          {/* Table Section - Left */}
          <div className={styles.tableSection}>
            <h4>Junction List ({junctions?.length || 0} total)</h4>
            {junctions?.length > 0 ? (
              <div className={styles.junctionTable}>
                <table>
                  <thead>
                    <tr>
                      
                      <th>Coordinates</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {junctions.map(junction => {
                      const lat = junction.latitude || 0;
                      const lng = junction.longitude || 0;
                      return (
                        <tr 
                          key={junction.fid}
                          className={selectedJunction?.fid === junction.fid ? styles.selectedRow : ''}
                        >
                          
                          <td>
                            {lat.toFixed(6)}, {lng.toFixed(6)}
                          </td>
                          <td>
                            <button 
                              onClick={() => setSelectedJunction(junction)}
                              className={styles.viewButton}
                            >
                              {selectedJunction?.fid === junction.fid ? 'Viewing' : 'View'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.noData}>No junction data available</div>
            )}
          </div>

          {/* Map Section - Right */}
          <div className={styles.mapSection}>
            <JunctionMap 
              junctions={junctions} 
              selectedJunction={selectedJunction}
              onJunctionSelect={setSelectedJunction}
              center={MUMBAI_CENTER}
              zoom={DEFAULT_ZOOM}
            />
            
            {selectedJunction && (
              <div className={styles.detailSection}>
                <h4>Junction Details</h4>
                <div className={styles.detailCard}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>FID:</span>
                    <span>{selectedJunction.fid}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Coordinates:</span>
                    <span>
                      {selectedJunction.latitude?.toFixed(6) || '0.000000'}, 
                      {selectedJunction.longitude?.toFixed(6) || '0.000000'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}