import { useState, useEffect } from 'react';
import styles from '../../styles/layout/sidebar.module.css';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';
import { FiUsers, FiMap, FiMapPin, FiCheckSquare, FiGitBranch } from "react-icons/fi";
import { FaRoad } from "react-icons/fa";
import { TbTimelineEvent } from "react-icons/tb";



export default function WardSidebar({ 
  wardId, 
  activeTab, 
  setActiveTab,
  disabledTabs = []
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // State for ward selection
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);
  const [currentDivision, setCurrentDivision] = useState(null);
  const [selectedWardId, setSelectedWardId] = useState(null);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [wardsError, setWardsError] = useState(null);

  const isTabDisabled = (tab) => disabledTabs.includes(tab);

  // Fetch all divisions on mount
  useEffect(() => {
    const fetchDivisions = async () => {
      setLoadingDivisions(true);
      try {
        const { data, error } = await supabase
          .from('division')
          .select('division_id, division_name')
          .order('division_id', { ascending: true });
        if (error) throw error;
        setDivisions(data);
      } catch (err) {
        console.error('Error fetching divisions:', err);
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisions();
  }, []);

  // Fetch division and set selected ward on first mount or URL change
  useEffect(() => {
    if (!wardId) return;

    const fetchDivisionForWard = async () => {
      try {
        const { data, error } = await supabase
          .from('ward')
          .select('division_id')
          .eq('ward_id', wardId)
          .single();

        if (error) throw error;
        setCurrentDivision(data.division_id);
        setSelectedWardId(wardId);
      } catch (err) {
        console.error('Error getting ward info:', err);
      }
    };

    fetchDivisionForWard();
  }, [wardId]);

  useEffect(() => {
    if (!currentDivision) return;
    const fetchWards = async () => {
      setLoadingWards(true);
      setWardsError(null);
      try {
        const { data, error } = await supabase
          .from('ward')
          .select('ward_id, ward_name')
          .eq('division_id', currentDivision)
          .order('ward_name', { ascending: true });
        if (error) throw error;
        setWards(data);
        if (data && data.length > 0) {
          if (!wardId) {
            setSelectedWardId(data[0].ward_id);
            router.push(`/wards/${data[0].ward_id}`);
          } else {
            setSelectedWardId(wardId);
          }
        } else {
          setSelectedWardId(null);
        }
      } catch (err) {
        setWardsError(err.message);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [currentDivision, wardId]);

  const handleDivisionChange = (divisionId) => {
    setCurrentDivision(divisionId);
    setWards([]);
    setSelectedWardId(null);
  };

  const handleWardChange = (wardId) => {
    setSelectedWardId(wardId);
    router.push(`/wards/${wardId}`);
  };

  return (
    <div 
      className={`${styles.leftSidebar} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={styles.logoContainer}
        onClick={() => router.push('/')}
        aria-label="Home"
        role="button"
        tabIndex={0}
        title="Home"
      >
        <div className={styles.logoContent}>
          <img src="/wp_icon_sm.png" className={styles.logoIcon} />
          {isHovered && <img src="/wp_text_logo.png" className={styles.logoText} />}
        </div>
      </div>

      {/* Dropdowns - always show icons */}
      <div className={styles.selector}>
        {/* Division Dropdown */}
        <div className={styles.dropdownWrapper}>
          <FiMap className={styles.dropdownIcon} title="Division" />
          {isHovered && (
            <>
              {loadingDivisions ? (
                <p>Loading...</p>
              ) : (
                <select
                  id="division-select"
                  value={currentDivision || ''}
                  onChange={e => handleDivisionChange(e.target.value)}
                  className={styles.dropdown}
                >
                  {divisions.map((division) => (
                    <option key={division.division_id} value={division.division_id}>
                      {division.division_name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>

        {/* Ward Dropdown */}
        <div className={styles.dropdownWrapper}>
          <FiMapPin className={styles.dropdownIcon} title="Ward" />
          {isHovered && (
            <>
              {loadingWards ? (
                <p>Loading...</p>
              ) : wardsError ? (
                <p>Error</p>
              ) : (
                <select
                  id="ward-select"
                  value={selectedWardId || ''}
                  onChange={e => handleWardChange(e.target.value)}
                  className={styles.dropdown}
                >
                  <option value="">Select Ward</option>
                  {wards.map((ward) => (
                    <option key={ward.ward_id} value={ward.ward_id}>
                      {ward.ward_name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
          onClick={() => setActiveTab('timeline')}
          title="Timeline"
        >
          <TbTimelineEvent className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Timeline</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'member' ? styles.active : ''}`}
          onClick={() => setActiveTab('member')}
          title="Member"
        >
          <FiUsers className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Member</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'road' ? styles.active : ''}`}
          onClick={() => setActiveTab('road')}
          title="Road"
        >
          <FaRoad className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Road</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'junction' ? styles.active : ''}`}
          onClick={() => setActiveTab('junction')}
          title="Junction"
        >
          <FiGitBranch className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Junction</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'action' ? styles.active : ''}`}
          onClick={() => setActiveTab('action')}
          disabled={isTabDisabled('action')}
          title="Action"
        >
          <FiCheckSquare className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Action</span>}
        </button>
      </div>
    </div>
  );
}