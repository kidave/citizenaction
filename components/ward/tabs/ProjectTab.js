import { useState } from 'react';
import { Stepper, Step, StepLabel, StepContent } from '@mui/material';
import styles from '../../../styles/layout/project.module.css';
import ImageComparison from '../../shared/image/ImageComparison';


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
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Setting the Stage',
      content: (
        <div>
          <h4>Community Talk & Committee Formation</h4>
          <p>{project.setting || 'No rationale provided.'}</p>
          <h4>Kickoff</h4>
          <p>{project.rationale || 'No rationale provided.'}</p>
        </div>
      ),
    },
    {
      label: '2. Design Proposal',
      content: (
        <div>
          <h4>Proposed Improvements</h4>
          <p>{project.design_summary || 'No design summary available.'}</p>
          <ImageComparison 
            beforeImages={project.before_images || []}
            afterImages={project.proposed_design_images || []}
          />
        </div>
      ),
    },
    {
      label: '3. Implementation & Progress',
      content: (
        <div>
          <h4>Work in Progress</h4>
          <p>{project.progress_notes || 'Photos and updates coming soon.'}</p>
        </div>
      ),
    },
    {
      label: '4. Final Outcome',
      content: (
        <div>
          <h4>Transformation Complete</h4>
          <p>{project.end_date ? `Completed on ${project.end_date}` : 'Completion date not available.'}</p>
          <ImageComparison 
            beforeImages={project.before_images || []}
            afterImages={project.completed_images || []}
          />
        </div>
      )
    }
  ];

  return (
    <div className={styles.projectDetailContainer}>
      <div className={styles.projectHeader}>
        <h1>{project.title || 'Untitled Project'}</h1>
        <span className={`${styles.statusBadge} ${styles[project.status]}`}>
          {project.status?.replace('_', ' ') || 'Unknown'}
        </span>
      </div>

      <div className={styles.projectMap}>
        <p>Map showing the roads and junctions included in this project.</p>
      </div>

      <div className={styles.workflowStepper}>
        <h3>Project Workflow</h3>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel onClick={() => setActiveStep(index)} style={{ cursor: 'pointer' }}>
                {step.label}
              </StepLabel>
              <StepContent>{step.content}</StepContent>
            </Step>
          ))}
        </Stepper>
      </div>
    </div>
  );
}
