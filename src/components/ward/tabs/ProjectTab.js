// components/ward/tabs/ProjectTab.js - FIXED VERSION
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
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { ImageButton } from "components/shared/ui/Buttons";

const ProjectMap = dynamic(() => import("./ProjectMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading location map...</div>,
});

export default function ProjectTab() {
  const { wardCode } = useWard();
  const { data: projects, loading, error } = useWardProjects(wardCode);
  const { data: junctions } = useWardJunctions(wardCode);
  const { data: roads } = useWardRoads(wardCode);
  // DEBUG: Check the actual data structure
  console.log('🔍 ALL PROJECTS DATA:', projects);
  
  if (projects) {
    projects.forEach((project, index) => {
      console.log(`📁 Project ${index}: ${project.title}`, {
        id: project.id,
        totalFiles: project.files?.length || 0,
        filesByStep: project.files?.reduce((acc, file) => {
          acc[file.step] = (acc[file.step] || 0) + 1;
          return acc;
        }, {}),
        allFiles: project.files
      });
    });
  }

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
  
  // FIX: Use 'files' instead of 'images' - this matches what useWardData returns
  const stepFiles = project.files?.filter((file) => file.step === stepKey) || [];

  // DEBUG: Check what files are available for this step - MOVED AFTER stepFiles definition
  console.log(`🔍 Step ${stepKey} files for project ${project.title}:`, stepFiles.map(f => ({
    id: f.id,
    step: f.step,
    type: f.type,
    path: f.path
  })));

  // Get step content based on stepKey
  const getStepContent = (key) => {
    const stepContents = {
      "A": (
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
      "B": (
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
      "C": (
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
      "D": (
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
      "E": (
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
      "F": (
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
      )
    };
    
    return stepContents[key] || null;
  };

  const stepContent = getStepContent(stepKey);

  // FIX: Separate files by type FIRST, then pick side file
  const allImages = stepFiles.filter((file) => file.type === "image");
  const stacks = stepFiles.filter((file) => file.type === "stack");
  const before = stepFiles.filter((file) => file.type === "comparison-before");
  const after = stepFiles.filter((file) => file.type === "comparison-after");
  const documents = stepFiles.filter((file) => file.type === "document");
  const driveLinks = stepFiles.filter((file) => file.type === "drive-link");

  // Use first image as side file, rest as single images
  const sideFile = allImages[0];
  const singleImages = allImages.slice(1); // All images except the first one

  // Check if there's any content to display
  const hasContent = stepContent || sideFile || stepFiles.length > 0;
  
  if (!hasContent) return null;

  return (
    <div className={styles.stepMediaContainer}>
      {/* Step Content with Side File Layout */}
      {(stepContent || sideFile) && (
        <div className={styles.stepContentLayout}>
          {stepContent && (
            <div className={styles.stepTextContent}>
              {stepContent}
            </div>
          )}
          
          {/* Side File */}
          {sideFile && (
            <div className={styles.stepSideFile}>
              <ImageEmbed 
                src={sideFile.path} 
                alt={sideFile.caption || "Step image"} 
              />
              {sideFile.caption && (
                <p className={styles.imageCaption}>{sideFile.caption}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rest of the step media (full width) */}
      {(stacks.length > 0 || before.length > 0 || after.length > 0 || 
        documents.length > 0 || singleImages.length > 0 || driveLinks.length > 0) && (
        <div className={styles.stepMedia}>
          {/* Single Images (excluding the side file) */}
          {singleImages.length > 0 && (
            <div className={styles.singleImages}>
              {singleImages.map((file, idx) => (
                <div key={idx} className={styles.singleFileItem}>
                  <ImageEmbed src={file.path} alt={file.caption || "Image"} />
                  {file.caption && <p className={styles.imageCaption}>{file.caption}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Stacked Files */}
          {stacks.length > 0 && (
            <ButtonGroup>
              <ImageButton
                onClick={() => setPopupFiles(stacks.map((file) => file.path))}
              >
                View Stack ({stacks.length})
              </ImageButton>
              {popupFiles.length > 0 && (
                <ImageStackPopup files={popupFiles} onClose={() => setPopupFiles([])} />
              )}
            </ButtonGroup>
          )}

          {/* Before / After */}
          {(before.length > 0 || after.length > 0) && (
            <ImageComparison
              beforeImages={before.map((file) => file.path)}
              afterImages={after.map((file) => file.path)}
              beforeIndex={beforeIndex}
              afterIndex={afterIndex}
              onBeforeIndexChange={setBeforeIndex}
              onAfterIndexChange={setAfterIndex}
            />
          )}

          {/* Google Drive Embeds */}
          {driveLinks.length > 0 && (
            <div className={styles.driveLinksSection}>
              <h5>Drive Links</h5>
              {driveLinks.map((file, idx) => (
                <DriveEmbed key={idx} driveLink={file.path} title={file.caption || "Document"} />
              ))}
            </div>
          )}

          {/* Document Links */}
          {documents.length > 0 && (
            <div className={styles.documentsSection}>
              {documents.map((file, idx) => (
                <a
                  key={idx}
                  href={file.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.documentLink}
                >
                  {file.caption || `View Document ${idx + 1}`}
                </a>
              ))}
            </div>
          )}
        </div>
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

  // Check if a step has any content (fields or files)
  const stepHasContent = (stepFields) => {
    // Check if any field has content
    const hasFieldContent = stepFields.some(field => {
      const value = project[field];
      return value && value.toString().trim() !== '';
    });
    
    // Check if step has files
    const stepFiles = project.files?.filter(file => file.step === stepFields[0]?.charAt(0)) || [];
    const hasFiles = stepFiles.length > 0;
    
    return hasFieldContent || hasFiles;
  };

  // Predefined steps configuration
  const predefinedSteps = [
    {
      key: "A",
      label: "Setting the Stage",
      fields: ["community_engagement", "kickoff_notes"],
    },
    {
      key: "B",
      label: "Identifying the Project",
      fields: ["rationale", "assessment_tools", "route_analysis_report", "wardmap_url"],
    },
    {
      key: "C",
      label: "Coordination & Approval",
      fields: ["coordination_notes", "agencies_involved", "commencement_letter_url"],
    },
    {
      key: "D",
      label: "Execution & Monitoring",
      fields: ["progress_notes", "execution_details", "documentation_links"],
    },
    {
      key: "E",
      label: "Final Deliverables & Learnings",
      fields: ["learnings", "community_impact", "final_report_url"],
    },
    {
      key: "F",
      label: "Scale-Up & Legacy",
      fields: ["next_route", "support_to_other_wards", "legacy_notes"],
    },
  ];

  // Filter steps to only show those with content
  const activeSteps = predefinedSteps.filter(step => stepHasContent(step.fields));

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
          <div className={styles.titleSection}>
            <h3>{project.title}</h3>
            {project.description && (
              <p className={styles.projectDescription}>{project.description}</p>
            )}
          </div>
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
                  wardCode={project.ward_code}
                  junctions={junctions}
                  roads={roads}
                  viewOnly={true}
                />
              </div>
            )}

            {/* Workflow Steps */}
            {activeSteps.length > 0 && (
              <div className={styles.workflowStepper}>
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
                      <StepContent
                        stepKey={step.key}
                        project={project}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Content Message */}
            {activeSteps.length === 0 && (
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