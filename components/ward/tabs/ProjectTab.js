import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../../styles/layout/project.module.css';
import ImageComparison from '../../shared/image/ImageComparison';
import ImageStackPopup from '../../shared/image/ImageStackPopup';

export default function ProjectTab({ projects }) {
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return <div className={styles.projectPlaceholder}>No projects available</div>;
  }

  return (
    <div className={styles.projectList}>
      {projects.map((project, index) => (
        <SingleProject key={project.id || index} project={project} />
      ))}
    </div>
  );
}

function SingleProject({ project }) {
  const [popupImages, setPopupImages] = useState([]);
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  const steps = [
    {
      label: 'Setting the Stage',
      content: (
        <div>
          <h4>Community Talk & Committee Formation</h4>
          <p>{project.rationale || 'No rationale provided.'}</p>
        </div>
      ),
    },
    {
      label: 'Design Proposal',
      content: (
        <div>
          <h4>Proposed Improvements</h4>
          <p>{project.design_summary || 'No design summary available.'}</p>
          {project.after_images?.length > 0 && (
            <button
              onClick={() => setPopupImages(project.after_images)}
              className={styles.viewStackButton}
            >
              View Design
            </button>
          )}
        </div>
      ),
    },
    {
      label: 'Implementation & Progress',
      content: (
        <div>
          <h4>Work in Progress</h4>
          <p>{project.progress_notes || 'Photos and updates coming soon.'}</p>
        </div>
      ),
    },
    {
      label: 'Final Outcome',
      content: (
        <div>
          <h4>Transformation Complete</h4>
          <p>{project.end_date ? `Completed on ${project.end_date}` : 'Completion date not available.'}</p>
          <ImageComparison
            beforeImages={project.before_images || []}
            afterImages={project.proposed_design_images || []}
            beforeIndex={beforeIndex}
            afterIndex={afterIndex}
            onBeforeIndexChange={setBeforeIndex}
            onAfterIndexChange={setAfterIndex}
          />
          
        </div>
      ),
    },
  ];

  return (
    <div className={styles.projectDetailContainer}>
      <div className={styles.projectHeader}>
        <h1>{project.title}</h1>
        <span className={`${styles.statusBadge} ${styles[project.status]}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <div className={styles.projectMap}>
        <p>Map showing the roads and junctions included in this project.</p>
      </div>

      <div className={styles.workflowStepper}>
        <h3>Project Workflow</h3>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className={styles.stepContainer}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
            <div className={styles.stepContent}>{step.content}</div>
          </motion.div>
        ))}
      </div>

      <ImageStackPopup
        images={popupImages}
        onClose={() => setPopupImages([])}
      />
    </div>
  );
}
