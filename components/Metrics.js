import { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/components/card.module.css';
import { FaChartBar, FaMapMarkedAlt, FaRoute, FaUsers, FaHandsHelping, FaRoad } from 'react-icons/fa';
import { BsFillSignIntersectionSideFill } from "react-icons/bs";

function Metrics() {
  const [metrics, setMetrics] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const metricIcons = {
    "active ward committees": FaMapMarkedAlt,
    "members": FaUsers,
    "routes identified": FaRoute,
    "junctions identified": BsFillSignIntersectionSideFill,
    "tasks completed": FaHandsHelping,
    "road length (km)": FaRoad,
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from('metrics')
        .select('*');
      if (!error) setMetrics(data);
    };
    fetchMetrics();
  }, []);

  
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains(styles.metricsOverlay)) {
      setShowPopup(false);
    }
  };

  return (
    <>
      <div
        className={styles.metricsHeader}
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        onClick={() => setShowPopup((prev) => !prev)}
      >
        <FaChartBar className={styles.metricsIcon} />
      </div>
      {showPopup && (
        <div
          className={styles.metricsOverlay}
          onClick={handleOverlayClick}
        >
          <div
            className={styles.metricsPopup}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.metricsHeaderPopup}>
              <FaChartBar className={styles.metricsIcon} />
              <span>Project Metrics</span>
            </div>
            <div className={styles.metricsList}>
              {metrics.map((m, i) => {
                const labelKey = m.key ? m.key.toLowerCase() : m.label.toLowerCase();
                const Icon = metricIcons[labelKey] || FaMapMarkedAlt;
                return (
                  <div className={styles.metricSmall} key={i}>
                    <Icon className={styles.metricIcon} />
                    <div className={styles.number}>{m.number}</div>
                    <div className={styles.label}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Metrics;