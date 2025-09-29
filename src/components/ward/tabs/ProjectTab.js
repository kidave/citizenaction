import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import useWardProjects from "hooks/useWardProjects";
import styles from "styles/layout/project.module.css";
import ImageComparison from "components/shared/image/ImageComparison";
import ImageStackPopup from "components/shared/image/ImageStackPopup";

export default function ProjectTab() {
  const { wardId } = useWard();
  const { projects, loading, error, resolveUrl } = useWardProjects(wardId);

  if (loading) return;
  if (error) return <p>Error loading projects: {error.message}</p>;
  if (!projects || projects.length === 0) {
    return <div className={styles.projectPlaceholder}>No projects available</div>;
  }

  return (
    <div className={styles.projectList}>
      {projects.map((project, index) => (
        <SingleProject
          key={project.id || index}
          project={project}
          resolveUrl={resolveUrl}
        />
      ))}
    </div>
  );
}

function StepContent({ stepKey, project, resolveUrl }) {
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);
  const [popupImages, setPopupImages] = useState([]);

  const images = project.project_images?.filter((img) => img.step === stepKey) || [];
  if (images.length === 0) return null;

  const stacks = images.filter((img) => img.type === "stack");
  const before = images.filter((img) => img.type === "comparison-before");
  const after = images.filter((img) => img.type === "comparison-after");

  return (
    <div className={styles.stepMedia}>
      {/* Image Stack Grid */}
      {stacks.length > 0 && (
        <>
          <button
            onClick={() => setPopupImages(stacks)}
            className={styles.viewStackButton}
          >
            View Images
          </button>
          <ImageStackPopup
            images={stacks.map((img) => ({ ...img, url: resolveUrl(img.path) }))}
            onClose={() => setPopupImages([])}
          />
        </>
      )}

      {/* Before / After Comparison */}
      {(before.length > 0 || after.length > 0) && (
        <ImageComparison
          beforeImages={before.map((img) => resolveUrl(img.path))}
          afterImages={after.map((img) => resolveUrl(img.path))}
          beforeIndex={beforeIndex}
          afterIndex={afterIndex}
          onBeforeIndexChange={setBeforeIndex}
          onAfterIndexChange={setAfterIndex}
        />
      )}
    </div>
  );
}

function SingleProject({ project, resolveUrl }) {
  // Map status to display text
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed"
    };
    return statusMap[status] || status;
  };

      // Helper function to format dates
  const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const steps = [
    {
      key: "A",
      label: "Setting the Stage",
      content: (
        <>
          <h5>Community Engagement</h5>
          <p>{project.community_engagement || "No details yet."}</p>
          <h5>Kickoff</h5>
          <p>{project.kickoff_notes || "No kickoff notes yet."}</p>
        </>
      ),
    },
    {
      key: "B",
      label: "Identifying the Project",
      content: (
        <>
          <h5>Rationale</h5>
          <p>{project.rationale || "No rationale provided."}</p>
          <h5>Assessment Tools</h5>
          <p>{project.assessment_tools || "No assessment tools provided."}</p>
          <h5>Route Analysis</h5>
          <p>{project.route_analysis_report || "No route analysis report provided."}</p>
          {project.wardmap_url && <a href={project.wardmap_url}>View WardMAP</a>}
        </>
      ),
    },
    {
      key: "C",
      label: "Coordination & Approval",
      content: (
        <>
          <h5>Coordination Notes</h5>
          <p>{project.coordination_notes || "No coordination notes provided."}</p>
          <h5>Agencies Involved</h5>
          <p>{project.agencies_involved || "No agencies involved provided."}</p>
          {project.commencement_letter_url && (
            <a href={project.commencement_letter_url}>View Commencement Letter</a>
          )}
        </>
      ),
    },
    {
      key: "D",
      label: "Execution & Monitoring",
      content: (
        <>
          <h5>Progress Notes</h5>
          <p>{project.progress_notes || "No progress notes provided."}</p>
          <h5>Execution Details</h5>
          <p>{project.execution_details || "No execution details provided."}</p>
          {project.documentation_links && (
            <a href={project.documentation_links}>View Documentation</a>
          )}
        </>
      ),
    },
    {
      key: "E",
      label: "Final Deliverables & Learnings",
      content: (
        <>
          <h5>Learnings</h5>
          <p>{project.learnings || "No learnings provided."}</p>
          <h5>Community Impact</h5>
          <p>{project.community_impact || "No community impact details provided."}</p>
          {project.final_report_url && (
            <a href={project.final_report_url}>Download Final Report</a>
          )}
        </>
      ),
    },
    {
      key: "F",
      label: "Scale-Up & Legacy",
      content: (
        <>
          <h5>Next Route</h5>
          <p>{project.next_route || "No next route provided."}</p>
          <h5>Support to Other Wards</h5>
          <p>{project.support_to_other_wards || "No support details provided."}</p>
          <h5>Legacy Notes</h5>
          <p>{project.legacy_notes || "No legacy notes provided."}</p>
        </>
      ),
    },
  ];

  return (
    <div className={styles.projectDetailContainer}>
      {/* Enhanced Project Header */}
      <div className={styles.projectHeader}>
        <div className={styles.projectTitleSection}>
          <h3>{project.title}</h3>
          <div className={styles.projectMeta}>
            {project.location && (
              <span className={styles.projectLocation}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                </svg>
                {project.location}
              </span>
            )}
            {project.start_date && (
              <span className={styles.projectDate}>
                Start Date:
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z" fill="currentColor"/>
                </svg>
                {formatDate(project.start_date)}
              </span>
            )}
            {project.end_date && (
              <span className={styles.projectDate}>
                End Date:
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z" fill="currentColor"/>
                </svg>
                {formatDate(project.end_date)}
              </span>
            )}
          </div>
        </div>
        <div className={styles.statusSection}>
          <span className={`${styles.statusBadge} ${styles[project.status]}`}>
            {getStatusDisplay(project.status)}
          </span>
        </div>
      </div>

      <div className={styles.workflowStepper}>
        {steps.map((step, i) => (
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
                resolveUrl={resolveUrl}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}