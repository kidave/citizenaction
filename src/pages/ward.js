// pages/ward/index.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "components/home/Layout";
import { supabase } from "utils/supabaseClient";
import styles from "styles/layout/wardoverview.module.css";
import { FiMapPin, FiFilter, FiArrowRight, FiImage } from "react-icons/fi";

export default function WardOverview() {
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [latestMeetings, setLatestMeetings] = useState([]);
  const [latestProjects, setLatestProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState("all");
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, [filterCity]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch cities for filter
      const { data: citiesData } = await supabase
        .from("city")
        .select("code, name")
        .order("name");
      
      setCities(citiesData || []);

      // Build base queries using the views
      let meetingQuery = supabase
        .from("ward_meeting_with_files")
        .select(`
          *,
          ward:ward_code (name, division:division_code (city:city_code (code, name)))
        `)
        .order("date", { ascending: false })
        .limit(3);

      let updateQuery = supabase
        .from("ward_update_with_files")
        .select(`
          *,
          ward:ward_code (name, division:division_code (city:city_code (code, name)))
        `)
        .order("date", { ascending: false })
        .limit(3);

      let projectQuery = supabase
        .from("ward_project_with_files")
        .select(`
          *,
          ward:ward_code (name, division:division_code (city:city_code (code, name)))
        `)
        .order("start_date", { ascending: false })
        .limit(3);

      // Apply city filter if needed
      if (filterCity !== "all") {
        meetingQuery = meetingQuery.eq("ward.division.city.code", filterCity);
        updateQuery = updateQuery.eq("ward.division.city.code", filterCity);
        projectQuery = projectQuery.eq("ward.division.city.code", filterCity);
      }

      // Execute all queries
      const [
        { data: meetingsData },
        { data: updatesData },
        { data: projectsData }
      ] = await Promise.all([
        meetingQuery,
        updateQuery,
        projectQuery
      ]);

      setLatestMeetings(meetingsData || []);
      setLatestUpdates(updatesData || []);
      setLatestProjects(projectsData || []);
      
    } catch (error) {
      console.error("Error fetching ward data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatDateU = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });
  };

  const statusConfig = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    on_hold: 'On Hold',
    cancelled: 'Cancelled',
    planned: 'planning'
  };

  const resolveUrl = (path) => {
    return supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;
  };

  // Card Components
  const MeetingCard = ({ meeting }) => (
    <motion.div 
      className={styles.card}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Gallery */}
      {meeting.files && meeting.files.length > 0 && (
        <div className={styles.cardfiles}>
          <div className={styles.imageGrid}>
            {meeting.files.slice(0, 1).map((file) => (
              <CardImage 
                key={file.id} 
                src={resolveUrl(file.path)} 
                alt="Meeting photo" 
              />
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.cardHeader}>
        <h3>{meeting.title}</h3>
        <span className={styles.date}>
          {formatDate(meeting.date)}
        </span>
      </div>
      <div className={styles.cardBody}>
        <p>{meeting.notable_attendees || "No notable attendees"}</p>
      </div>
      <div className={styles.cardFooter}>
        <span className={styles.wardBadge}>
          <FiMapPin />
          {meeting.ward.name} Ward, {meeting.ward.division.city.name}
        </span>
        <a 
          href={`/ward/${meeting.ward_code}/meeting`}
          className={styles.viewMore}
        >
          View Details <FiArrowRight />
        </a>
      </div>
    </motion.div>
  );

  const ProjectCard = ({ project }) => (
    <motion.div 
      className={styles.card}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Gallery */}
      {project.files && project.files.length > 0 && (
        <div className={styles.cardfiles}>
          <div className={styles.imageGrid}>
            {project.files.slice(0, 1).map((file) => (
              <CardImage 
                key={file.id} 
                src={resolveUrl(file.path)} 
                alt={`Project ${file.step} - ${file.type}`} 
              />
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.cardHeader}>
        <h3>{project.title}</h3>
        <span className={`${styles.status} ${styles[project.status]}`}>
          {statusConfig[project.status] || (project.status)}
        </span>
      </div>
      <div className={styles.cardFooter}>
        <span className={styles.wardBadge}>
          <FiMapPin />
          {project.ward.name} Ward, {project.ward.division.city.name}
        </span>
        <a 
          href={`/ward/${project.ward_code}/project`}
          className={styles.viewMore}
        >
          View Project <FiArrowRight />
        </a>
      </div>
    </motion.div>
  );

  // Add this with MeetingCard and ProjectCard
  const UpdateCard = ({ update }) => (
    <motion.div 
      className={styles.card}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Gallery */}
      {update.files && update.files.length > 0 && (
        <div className={styles.cardImages}>
          <div className={styles.imageGrid}>
            {update.files.slice(0, 1).map((file) => (
              <CardImage 
                key={file.id} 
                src={resolveUrl(file.path)} 
                alt="Update photo" 
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.cardHeader}>
        <h3>{formatDateU(update.date)}</h3>
        <span className={styles.date}>
          {update.operation?.substring(0, 90)}
        </span>
      </div>
      <div className={styles.cardFooter}>
        <span className={styles.wardBadge}>
          <FiMapPin />
          {update.ward.name} Ward, {update.ward.division.city.name}
        </span>
        <a 
          href={`/ward/${update.ward_code}/update`}
          className={styles.viewMore}
        >
          Read More <FiArrowRight />
        </a>
      </div>
    </motion.div>
  );


  const CardImage = ({ src, alt }) => {
    const [error, setError] = useState(false);

    if (error) {
      return (
        <div className={styles.imageError}>
          <FiImage />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={styles.cardImage}
        onError={() => setError(true)}
        loading="lazy"
      />
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading ward updates...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.wardOverview}>
        {/* Header Section */}
        <div className={styles.header}>
          {/* Filter Section */}
          <div className={styles.filterSection}>
            <FiFilter className={styles.filterIcon} />
            <select 
              value={filterCity} 
              onChange={(e) => setFilterCity(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Sections */}
        <div className={styles.contentSections}>
          {/* Projects Section */}
          <section className={styles.section}>
            <div className={styles.cardsContainer}>
              {latestProjects.length > 0 ? (
                latestProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <p className={styles.noData}>No active projects found</p>
              )}
            </div>
          </section>

          {/* Latest Meetings Section */}
          <section className={styles.section}>
            <div className={styles.cardsContainer}>
              {latestMeetings.length > 0 ? (
                latestMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))
              ) : (
                <p className={styles.noData}>No recent meetings found</p>
              )}
            </div>
          </section>

          {/* Monthly Updates Section */}
          <section className={styles.section}>
            <div className={styles.cardsContainer}>
              {latestUpdates.length > 0 ? (
                latestUpdates.map((update) => (
                  <UpdateCard key={update.id} update={update} />
                ))
              ) : (
                <p className={styles.noData}>No monthly updates found</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}