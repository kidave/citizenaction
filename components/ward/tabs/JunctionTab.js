'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../../styles/layout/junction.module.css';
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useWard } from '../../../src/context/WardContext';


const JunctionMap = dynamic(
  () => import('./JunctionMap'),
  { 
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Loading map...</div>
  }
);

export default function JunctionTab({ junctions }) {
  const { wardInfo, boundary } = useWard();
  const [selectedJunction, setSelectedJunction] = useState(null);
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  useEffect(() => {
    setSelectedJunction(null);
    setBeforeIndex(0);
    setAfterIndex(0);
  }, [junctions]);

  const beforeImages = selectedJunction ? [
    { 
      url: `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/junction/Mumbai/${wardInfo?.wardName}/${selectedJunction.fid}/before1.jpg`,
      date: '2023-01-15'
    },
    { 
      url: `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/junction/Mumbai/${wardInfo?.wardName}/${selectedJunction.fid}/before2.jpg`,
      date: '2023-01-20'
    }
  ] : [];

  const afterImages = selectedJunction ? [
    { 
      url: `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/junction/Mumbai/${wardInfo?.wardName}/${selectedJunction.fid}/after1.jpg`,
      date: '2023-06-20'
    },
    { 
      url: `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/junction/Mumbai/${wardInfo?.wardName}/${selectedJunction.fid}/after2.jpg`,
      date: '2023-07-15'
    }
  ] : [];

  const renderContent = () => {
    if (junctions === undefined) {
      return <div className={styles.loading}>Loading junction data...</div>;
    }

    return (
      <>
        <TopSection 
          junctions={junctions} 
          selectedJunction={selectedJunction}
          onSelectJunction={setSelectedJunction}
          boundary={boundary}
        />
        
        {selectedJunction && (
          <BottomSection 
            junction={selectedJunction}
            beforeImages={beforeImages}
            afterImages={afterImages}
            beforeIndex={beforeIndex}
            afterIndex={afterIndex}
            onBeforeIndexChange={setBeforeIndex}
            onAfterIndexChange={setAfterIndex}
          />
        )}
      </>
    );
  };

  return (
    <div className={styles.junctionContainer}>
      <Header 
        junctionCount={junctions?.length || 0} 
        wardName={wardInfo?.wardName} 
      />
      <Description />
      {renderContent()}
    </div>
  );
}

// Child Components
function Header({ junctionCount, wardName }) {
  return (
    <div className={styles.junctionHeader}>
      <FaMapMarkerAlt className={styles.junctionHeaderIcon} />
      <div>
        <h3 className={styles.junctionTitle}>
          Identified {junctionCount} Junctions in {wardName} Ward
        </h3>
        <p className={styles.junctionSubtitle}>
          Mapping key intersections to improve walkability and safety in your ward.
        </p>
      </div>
    </div>
  );
}

function Description() {
  return (
    <div className={styles.junctionDescription}>
      Each junction represents a critical point for pedestrian movement and traffic flow. 
      Explore the map and table below to see identified junctions, their suggested design, and images. 
      Click on a junction to view more information.
    </div>
  );
}

function TopSection({ junctions, selectedJunction, onSelectJunction }) {
  const MUMBAI_CENTER = [19.0760, 72.8777];
  const DEFAULT_ZOOM = 12;

  return (
    <div className={styles.topSection}>
      <div className={styles.tableSection}>
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
                          onClick={() => onSelectJunction(junction)}
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

      <div className={styles.mapSection}>
        <JunctionMap 
          junctions={junctions} 
          selectedJunction={selectedJunction}
          onJunctionSelect={onSelectJunction}
          center={MUMBAI_CENTER}
          zoom={DEFAULT_ZOOM}
        />
      </div>
    </div>
  );
}

function BottomSection({ junction, beforeImages, afterImages, beforeIndex, afterIndex, onBeforeIndexChange, onAfterIndexChange }) {
  return (
    <div className={styles.bottomSection}>
      <DetailsCard junction={junction} />
      <ImageComparison 
        beforeImages={beforeImages}
        afterImages={afterImages}
        beforeIndex={beforeIndex}
        afterIndex={afterIndex}
        onBeforeIndexChange={onBeforeIndexChange}
        onAfterIndexChange={onAfterIndexChange}
      />
    </div>
  );
}

function DetailsCard({ junction }) {
  return (
    <div className={styles.detailSection}>
      <h4>Suggested Improvement</h4>
      <div className={styles.detailCard}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>FID:</span>
          <span>{junction.fid}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Junction Name:</span>
          <span>{junction.junction_name}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Coordinates:</span>
          <span>
            {junction.latitude?.toFixed(6) || '0.000000'}, 
            {junction.longitude?.toFixed(6) || '0.000000'}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Design Suggestion:</span>
          <span>{junction.suggested_design}</span>
        </div>
      </div>
    </div>
  );
}

function ImageComparison({ beforeImages, afterImages, beforeIndex, afterIndex, onBeforeIndexChange, onAfterIndexChange }) {
  return (
    <div className={styles.imageComparison}>
      <ImagePanel
        title="Before"
        images={beforeImages}
        currentIndex={beforeIndex}
        onNavigate={onBeforeIndexChange}
      />
      <ImagePanel
        title="After"
        images={afterImages}
        currentIndex={afterIndex}
        onNavigate={onAfterIndexChange}
      />
    </div>
  );
}

function ImagePanel({ title, images, currentIndex, onNavigate }) {
  const hasImages = images.length > 0;

  return (
    <div className={styles.imageGrid}>
      <h5>{title}</h5>
      <div className={styles.imageSlider}>
        {hasImages ? (
          <>
            <button
              onClick={() => onNavigate(prev => Math.max(0, prev - 1))}
              className={styles.navButton}
              disabled={images.length <= 1}
              aria-label="Previous image"
              type="button"
            >
              <FaChevronLeft />
            </button>
            <img 
              src={images[currentIndex]?.url}
              alt={`${title} ${currentIndex + 1}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/no-image.svg';
              }}
            />
            <button
              onClick={() => onNavigate(prev => (prev + 1) % images.length)}
              className={styles.navButton}
              disabled={images.length <= 1}
              aria-label="Next image"
              type="button"
            >
              <FaChevronRight />
            </button>
            {images.length > 1 && (
              <div className={styles.imageCounter}>
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </>
        ) : (
          <div className={styles.imagePlaceholder}>
            <img
              src='/no-image.svg'
              alt="No image available"
              className={styles.noImage}
            />
          </div>
        )}
      </div>
    </div>
  );
}