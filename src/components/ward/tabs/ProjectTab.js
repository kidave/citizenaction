import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import useWardProjects from "hooks/useWardProjects";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/project.module.css";
import ImageComparison from "components/shared/image/ImageComparison";
import ImageStackPopup from "components/shared/image/ImageStackPopup";

export default function ProjectTab() {
  const { wardId } = useWard();
  const { projects, loading, error, resolveUrl } = useWardProjects(wardId);

  if (loading) return <Spinner />;
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
  const steps = [
    {
      key: "A",
      label: "Setting the Stage",
      content: (
        <>
          <h4>Community Engagement</h4>
          <p>{project.community_engagement || "No details yet."}</p>
          <h4>Kickoff</h4>
          <p>{project.kickoff_notes || "No kickoff notes yet."}</p>
        </>
      ),
    },
    {
      key: "B",
      label: "Identifying the Project",
      content: (
        <>
          <h4>Rationale</h4>
          <p>{project.rationale || "No rationale provided."}</p>
          <h4>Assessment Tools</h4>
          <p>{project.assessment_tools || "No assessment tools provided."}</p>
          <h4>Route Analysis</h4>
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
          <h4>Coordination Notes</h4>
          <p>{project.coordination_notes || "No coordination notes provided."}</p>
          <h4>Agencies Involved</h4>
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
          <h4>Progress Notes</h4>
          <p>{project.progress_notes || "No progress notes provided."}</p>
          <h4>Execution Details</h4>
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
          <h4>Learnings</h4>
          <p>{project.learnings || "No learnings provided."}</p>
          <h4>Community Impact</h4>
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
          <h4>Next Route</h4>
          <p>{project.next_route || "No next route provided."}</p>
          <h4>Support to Other Wards</h4>
          <p>{project.support_to_other_wards || "No support details provided."}</p>
          <h4>Legacy Notes</h4>
          <p>{project.legacy_notes || "No legacy notes provided."}</p>
        </>
      ),
    },
  ];

  return (
    <div className={styles.projectDetailContainer}>
      <div className={styles.projectHeader}>
        <h1>{project.title}</h1>
        <span className={`${styles.statusBadge} ${styles[project.status]}`}>
          {project.status.replace("_", " ")}
        </span>
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
              <span className={styles.stepNumber}>{step.key}.</span>
              <span className={styles.stepLabel}>{step.label}</span>
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
