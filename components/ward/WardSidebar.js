// components/ward/WardSidebar.js

import { useState, useEffect } from 'react';
import styles from '../../styles/layout/sidebar.module.css';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';
import { FaMap } from "react-icons/fa6";
import { FaUsers, FaRoad } from "react-icons/fa";
import { BsFillSignIntersectionSideFill } from "react-icons/bs";
import { TbTimelineEventFilled } from "react-icons/tb";
import { PiMapPinAreaFill } from "react-icons/pi";
import { MdAssignment } from "react-icons/md";


export default function WardSidebar({ 
  disabledTabs = []
}) {
  const router = useRouter();
  const { wardId, tab: activeTab } = router.query;
  const [isHovered, setIsHovered] = useState(false);

  // State for ward selection
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);
  const [currentDivision, setCurrentDivision] = useState(null);
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
          .select('code, name')
          .order('code', { ascending: true });
        if (error) throw error;
        setDivisions(data);
      } catch (err) {
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisions();
  }, []);

  // Fetch division for the current wardId from the URL
  useEffect(() => {
    if (!wardId) return;

    const fetchDivisionForWard = async () => {
      try {
        const { data, error } = await supabase
          .from('ward')
          .select('division_code')
          .eq('code', wardId)
          .single();

        if (error) throw error;
        setCurrentDivision(data.division_code);
      } catch (err) {
        console.error('Error getting ward info:', err);
      }
    };

    fetchDivisionForWard();
  }, [wardId]);

  // Fetch all wards within the current division
  useEffect(() => {
    if (!currentDivision) return;
    const fetchWards = async () => {
      setLoadingWards(true);
      setWardsError(null);
      try {
        const { data, error } = await supabase
          .from('ward')
          .select('code, name')
          .eq('division_code', currentDivision)
          .order('name', { ascending: true });
        if (error) throw error;
        setWards(data);
      } catch (err) {
        setWardsError(err.message);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [currentDivision]);

  const handleDivisionChange = (divisionCode) => {
    setCurrentDivision(divisionCode);
    setWards([]); 
  };
  
  const handleWardChange = (newWardId) => {
    if (newWardId) {
        const currentTab = activeTab || 'timeline';
        router.push(`/ward/${newWardId}/${currentTab}`);
    }
  };

  const handleTabClick = (tabName) => {
    if (wardId) {
      router.push(`/ward/${wardId}/${tabName}`);
    }
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
          <img src="/wp_icon_sm.png" alt="Walking Project Logo" className={styles.logoIcon} />
          {isHovered && <img src="/wp_text_logo.png" alt="Walking Project" className={styles.logoText} />}
        </div>
      </div>

      {/* Dropdowns */}
      <div className={styles.selector}>
        <div className={styles.dropdownWrapper}>
          <FaMap className={styles.dropdownIcon} title="Division" />
          {isHovered && (
            <select
              id="division-select"
              value={currentDivision || ''}
              onChange={e => handleDivisionChange(e.target.value)}
              className={styles.dropdown}
              aria-label="Select Division"
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division.code} value={division.code}>
                  {division.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.dropdownWrapper}>
          <PiMapPinAreaFill  className={styles.dropdownIcon} title="Ward" />
          {isHovered && (
             <select
                  id="ward-select"
                  value={wardId || ''}
                  onChange={e => handleWardChange(e.target.value)}
                  className={styles.dropdown}
                  aria-label="Select Ward"
                  disabled={!currentDivision || loadingWards}
                >
                  <option value="">Select Ward</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
          onClick={() => handleTabClick('timeline')}
          title="Timeline"
        >
          <TbTimelineEventFilled className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Timeline</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'member' ? styles.active : ''}`}
          onClick={() => handleTabClick('member')}
          title="Member"
        >
          <FaUsers className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Committee</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'project' ? styles.active : ''}`}
          onClick={() => handleTabClick('project')}         
          title="Project"
        >
          <MdAssignment className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Project</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'road' ? styles.active : ''}`}
          onClick={() => handleTabClick('road')}
          title="Road"
        >
          <FaRoad className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Routes Identified</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'junction' ? styles.active : ''}`}
          onClick={() => handleTabClick('junction')}
          title="Junction"
        >
          <BsFillSignIntersectionSideFill className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Junction Design</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'action' ? styles.active : ''} ${isTabDisabled('action') ? styles.disabled : ''}`}
          onClick={() => handleTabClick('action')}         
          title="Action"
          disabled={isTabDisabled('action')}
        >
          <MdAssignment className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Actions Taken</span>}
        </button>
      </div>
    </div>
  );
}