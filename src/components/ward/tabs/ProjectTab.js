// components/ward/tabs/ProjectTab.js
import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useWard } from "context/WardContext";
import { useWardProjects, useWardJunctions, useWardRoads } from "hooks/useWardData";
import styles from "styles/tabs/project.module.css";
import ImageComparison from "components/shared/image/ImageComparison";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import ImageEmbed from "components/shared/image/ImageEmbed";
import DriveEmbed from "components/shared/ui/DriveEmbed";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const ProjectMap = dynamic(() => import("./ProjectMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading location map...</div>,
});

export default function ProjectTab() {
  const { wardId } = useWard();
  const { data: projects, loading, error } = useWardProjects(wardId);
  const { data: junctions } = useWardJunctions(wardId);
  const { data: roads } = useWardRoads(wardId);

  if (loading) return;
  if (error) return <p>Error loading projects: {error.message}</p>;

  const publishedProjects = projects?.filter(project => project.is_published) || [];
  
  if (publishedProjects.length === 0) {
    return <p className={styles.empty}>No projects yet.</p>
  }

  return (
    <div className={styles.projectList}>
      {publishedProjects.map((project, index) => (
        <SingleProject
          key={project.id || index}
          project={project}
          junctions={junctions}
          roads={roads}
          index={index}
        />
      ))}
    </div>
  );
}

function StepContent({ stepKey, project }) {
  const [popupFiles, setPopupFiles] = useState([]);
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);


  const images = project.images?.filter((img) => img.step === stepKey) || [];
  if (images.length === 0) return null;

  const stacks = images.filter((img) => img.type === "stack");
  const before = images.filter((img) => img.type === "comparison-before");
  const after = images.filter((img) => img.type === "comparison-after");
  const documents = images.filter((img) => img.type === "document");
  const singleImages = images.filter((img) => img.type === "image");
  const driveLinks = images.filter((img) => img.type === "drive-link");

  return (
    <div className={styles.stepMedia}>
      {/* Single Images */}
      {singleImages.length > 0 && (
        <div className={styles.singleImages}>
          {singleImages.map((img, idx) => (
            <div key={idx} className={styles.singleImageItem}>
              <ImageEmbed src={img.path} alt={img.caption || "Image"} />
              {img.caption && <p className={styles.imageCaption}>{img.caption}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Stacked Images */}
      {stacks.length > 0 && (
        <>
          <button
            onClick={() => setPopupFiles(stacks.map((img) => img.path))}
            className={styles.viewStackButton}
          >
            View Stack ({stacks.length})
          </button>
          {popupFiles.length > 0 && (
            <ImageStackPopup files={popupFiles} onClose={() => setPopupFiles([])} />
          )}
        </>
      )}

      {/* Document Links */}
      {documents.length > 0 && (
        <div className={styles.documentsSection}>
          <h5>Documents</h5>
          {documents.map((doc, idx) => (
            <a
              key={idx}
              href={doc.path}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.documentLink}
            >
              📄 {doc.caption || `Document ${idx + 1}`}
            </a>
          ))}
        </div>
      )}

      {/* Google Drive Embeds */}
      {driveLinks.length > 0 && (
        <div className={styles.driveLinksSection}>
          <h5>Drive Links</h5>
          {driveLinks.map((d, idx) => (
            <DriveEmbed key={idx} driveLink={d.path} title={d.caption || "Document"} />
          ))}
        </div>
      )}

      {/* Before / After */}
      {(before.length > 0 || after.length > 0) && (
        <ImageComparison
          beforeImages={before.map((img) => img.path)}
          afterImages={after.map((img) => img.path)}
          beforeIndex={beforeIndex}
          afterIndex={afterIndex}
          onBeforeIndexChange={setBeforeIndex}
          onAfterIndexChange={setAfterIndex}
        />
      )}
    </div>
  );
}

function SingleProject({ project, junctions, roads, index }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  // Map status to display text
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: "Planning",
      in_progress: "In Progress",
      completed: "Completed"
    };
    return statusMap[status] || status;
  };

  // Helper function to format dates
  const formatDate = (date) => {
    if (!date) return "";
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Check if a step has any content (fields or images)
  const stepHasContent = (stepFields) => {
    // Check if any field has content
    const hasFieldContent = stepFields.some(field => {
      const value = project[field];
      return value && value.toString().trim() !== '';
    });
    
    // Check if step has images
    const stepImages = project.images?.filter(img => img.step === stepFields[0]?.charAt(0)) || [];
    const hasImages = stepImages.length > 0;
    
    return hasFieldContent || hasImages;
  };

  // Check if a custom section has content
  const customSectionHasContent = (section) => {
    return section.content && section.content.trim() !== '';
  };

  // Predefined steps configuration
  const predefinedSteps = [
    {
      key: "A",
      label: "Setting the Stage",
      fields: ["community_engagement", "kickoff_notes"],
      content: (
        <>
          {project.community_engagement && (
            <>
              <h5>Community Engagement</h5>
              <p>{project.community_engagement}</p>
            </>
          )}
          {project.kickoff_notes && (
            <>
              <h5>Kickoff</h5>
              <p>{project.kickoff_notes}</p>
            </>
          )}
        </>
      ),
    },
    {
      key: "B",
      label: "Identifying the Project",
      fields: ["rationale", "assessment_tools", "route_analysis_report", "wardmap_url"],
      content: (
        <>
          {project.rationale && (
            <>
              <h5>Rationale</h5>
              <p>{project.rationale}</p>
            </>
          )}
          {project.assessment_tools && (
            <>
              <h5>Assessment Tools</h5>
              <p>{project.assessment_tools}</p>
            </>
          )}
          {project.route_analysis_report && (
            <>
              <h5>Route Analysis</h5>
              <p>{project.route_analysis_report}</p>
            </>
          )}
          {project.wardmap_url && (
            <a href={project.wardmap_url} target="_blank" rel="noopener noreferrer">
              View WardMAP
            </a>
          )}
        </>
      ),
    },
    {
      key: "C",
      label: "Coordination & Approval",
      fields: ["coordination_notes", "agencies_involved", "commencement_letter_url"],
      content: (
        <>
          {project.coordination_notes && (
            <>
              <h5>Coordination Notes</h5>
              <p>{project.coordination_notes}</p>
            </>
          )}
          {project.agencies_involved && (
            <>
              <h5>Agencies Involved</h5>
              <p>{project.agencies_involved}</p>
            </>
          )}
          {project.commencement_letter_url && (
            <a href={project.commencement_letter_url} target="_blank" rel="noopener noreferrer">
              View Commencement Letter
            </a>
          )}
        </>
      ),
    },
    {
      key: "D",
      label: "Execution & Monitoring",
      fields: ["progress_notes", "execution_details", "documentation_links"],
      content: (
        <>
          {project.progress_notes && (
            <>
              <h5>Progress Notes</h5>
              <p>{project.progress_notes}</p>
            </>
          )}
          {project.execution_details && (
            <>
              <h5>Execution Details</h5>
              <p>{project.execution_details}</p>
            </>
          )}
          {project.documentation_links && (
            <a href={project.documentation_links} target="_blank" rel="noopener noreferrer">
              View Documentation
            </a>
          )}
        </>
      ),
    },
    {
      key: "E",
      label: "Final Deliverables & Learnings",
      fields: ["learnings", "community_impact", "final_report_url"],
      content: (
        <>
          {project.learnings && (
            <>
              <h5>Learnings</h5>
              <p>{project.learnings}</p>
            </>
          )}
          {project.community_impact && (
            <>
              <h5>Community Impact</h5>
              <p>{project.community_impact}</p>
            </>
          )}
          {project.final_report_url && (
            <a href={project.final_report_url} target="_blank" rel="noopener noreferrer">
              Download Final Report
            </a>
          )}
        </>
      ),
    },
    {
      key: "F",
      label: "Scale-Up & Legacy",
      fields: ["next_route", "support_to_other_wards", "legacy_notes"],
      content: (
        <>
          {project.next_route && (
            <>
              <h5>Next Route</h5>
              <p>{project.next_route}</p>
            </>
          )}
          {project.support_to_other_wards && (
            <>
              <h5>Support to Other Wards</h5>
              <p>{project.support_to_other_wards}</p>
            </>
          )}
          {project.legacy_notes && (
            <>
              <h5>Legacy Notes</h5>
              <p>{project.legacy_notes}</p>
            </>
          )}
        </>
      ),
    },
  ];

  // Filter steps to only show those with content
  const activeSteps = predefinedSteps.filter(step => stepHasContent(step.fields));

  // Get custom sections (ensure it's an array)
  const customSections = Array.isArray(project.custom_sections) 
    ? project.custom_sections.filter(section => customSectionHasContent(section))
    : [];

  return (
    <motion.div 
      className={styles.projectDetailContainer}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div 
        className={styles.projectHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.headerTop}>
          <h3>{project.title}</h3>
          <div className={styles.headerTopRight}>
            <span className={`${styles.statusBadge} ${styles[project.status]}`}>
              {getStatusDisplay(project.status)}
            </span>
          </div>
        </div>

        <div className={styles.headerBottom}>
          <div className={styles.headerDateLeft}>
            {project.start_date && (
              <span>
                <strong>Start Date - </strong>
                {formatDate(project.start_date)}
              </span>
            )}
            {project.end_date && (
              <span>
                <strong>End Date - </strong>
                {formatDate(project.end_date)}
              </span>
            )}
            
          </div>
          <div className={styles.headerDateRight}>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={styles.expandIcon}
            >
              <FaChevronDown />
            </motion.div>
          </div>
        </div>

        {/* Project Description */}
        {project.location && (
          <p>
            <strong>Location - </strong>{project.location}
          </p>
        )}
        {project.description && (
          <p>{project.description}</p>
        )}
        
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className={styles.expandableContent}>
            {/* Location Map */}
            {(project.junction_fid || project.road_fid) && (
              <div className={styles.locationMapSection}>
                <ProjectMap
                  junctionFid={project.junction_fid}
                  roadFid={project.road_fid}
                  projectTitle={project.title}
                  wardId={project.ward_code}
                  junctions={junctions}
                  roads={roads}
                  viewOnly={true}
                />
              </div>
            )}

            {/* Workflow Steps */}
            {(activeSteps.length > 0 || customSections.length > 0) && (
              <div className={styles.workflowStepper}>
                {/* Predefined Steps */}
                {activeSteps.map((step, i) => (
                  <motion.div
                    key={step.key}
                    className={styles.stepContainer}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    <div className={styles.stepHeader}>
                      <h4 className={styles.stepNumber}>{step.key}.</h4>
                      <h4 className={styles.stepLabel}>{step.label}</h4>
                    </div>
                    <div className={styles.stepContent}>
                      {step.content}
                      <StepContent
                        stepKey={step.key}
                        project={project}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Custom Sections */}
                {customSections.map((section, i) => (
                  <motion.div
                    key={`custom-${section.key}-${i}`}
                    className={styles.stepContainer}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: (activeSteps.length + i) * 0.1 }}
                  >
                    <div className={styles.stepHeader}>
                      <h4 className={styles.stepNumber}>{section.key}.</h4>
                      <h4 className={styles.stepLabel}>{section.label}</h4>
                    </div>
                    <div className={styles.stepContent}>
                      <p>{section.content}</p>
                      <StepContent
                        stepKey={section.key}
                        project={project}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Content Message */}
            {activeSteps.length === 0 && customSections.length === 0 && (
              <div className={styles.noContentMessage}>
                <p>No project details available yet. Check back later for updates.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}