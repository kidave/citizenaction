// components/admin/tabs/ProjectAdmin.js
import { useState, useEffect } from "react";
import { useAdmin } from "context/AdminContext";
import { useAdminWardProjects } from "hooks/useWardData";
import useWardCRUD from "hooks/useWardCRUD";
import { useAlert } from "hooks/useAlert";
import StatusBadge from 'components/shared/card/StatusBadge';
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { AddButton, EditButton, DeleteButton, SaveButton, CancelButton, PublishButton } from "components/shared/ui/Buttons";
import ProjectFileManager from "components/admin/ProjectFileManager";
import styles from "styles/tabs/project.module.css";

export default function ProjectAdmin({ wardCode }) {
  const { isAdmin } = useAdmin();
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const { data: projects, loading, error, refresh } = useAdminWardProjects(wardCode);
  const { create, update, remove } = useWardCRUD("ward_project", wardCode);

  const [editing, setEditing] = useState(null);
  const [publishingStates, setPublishingStates] = useState({});
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  const handleCreate = async (projectData) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(projectData).filter(([_, v]) => v !== undefined && v !== null)
      );
      await create(cleanData);
      showSuccessAlert({ message: "Project created successfully!" });
      setEditing(null);
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to create project", 
        errorDetails: err.message 
      });
      throw err;
    }
  };

  const handleUpdate = async (id, projectData) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(projectData).filter(([_, v]) => v !== undefined && v !== null)
      );
      await update(id, cleanData);
      showSuccessAlert({ message: "Project updated successfully!" });
      setEditing(null);
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to update project", 
        errorDetails: err.message 
      });
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setDeletingProjectId(id);
    showConfirmAlert({
      title: "Delete Project?",
      message: "This will remove the project and all its images.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(id);
          showSuccessAlert({ message: "Project deleted successfully!" });
          if (editing && editing.id === id) setEditing(null);
          await refresh();
        } catch (err) {
          showErrorAlert({ 
            message: "Failed to delete project", 
            errorDetails: err.message 
          });
        } finally {
          setDeletingProjectId(null);
        }
      },
      onCancel: () => {
        setDeletingProjectId(null);
      }
    });
  };

  const handlePublish = async (projectId, publishState) => {
    try {
      setPublishingStates(prev => ({ ...prev, [projectId]: true }));
      await update(projectId, { is_published: publishState });
      showSuccessAlert({ 
        message: `Project ${publishState ? 'published' : 'unpublished'} successfully!` 
      });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: `Failed to ${publishState ? 'publish' : 'unpublish'} project`, 
        errorDetails: err.message 
      });
    } finally {
      setPublishingStates(prev => ({ ...prev, [projectId]: false }));
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.adminPanel}>
        <AlertComponent />
        <div className={styles.errorMessage}>
          You don't have access to manage projects.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPanel}>
      <AlertComponent />
      
      <ButtonGroup>
        <AddButton
          variant="outline"
          onClick={() => setEditing({})}
          disabled={loading}
        >
          New Project
        </AddButton>
      </ButtonGroup>

      {error && <div className={styles.errorMessage}>Error: {error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading projects...</div>
      ) : (!projects || projects.length === 0) && !editing ? (
        <div className={styles.emptyState}>
          <p>No projects found. Create your first project to get started.</p>
        </div>
      ) : (
        <div>
          {projects?.map((project) => ( 
            <div key={project.id} className={styles.projectItem}>
              <h4>{project.title || "Untitled Project"}</h4>
              <div className={styles.cardHeaderRow}>
                <div className={styles.cardHeaderLeft}>
                  <StatusBadge 
                    status={project.is_published ? 'published' : 'draft'}
                    variant="badge"
                    customLabel={project.is_published ? 'Published' : 'Draft'}
                  />
                </div>
                <ButtonGroup>
                  <PublishButton
                    size="small"
                    published={project.is_published}
                    publishing={publishingStates[project.id]}
                    onClick={() => handlePublish(project.id, !project.is_published)}
                  />
                  <EditButton 
                    size="small" 
                    onClick={() => setEditing(project)}
                  >
                    Edit
                  </EditButton>
                  <DeleteButton
                    size="small"
                    variant="danger"
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingProjectId === project.id}
                    loading={deletingProjectId === project.id}
                  >
                    Delete
                  </DeleteButton>
                </ButtonGroup>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ProjectForm
          wardCode={wardCode}
          project={editing}
          onSave={async (proj) => {
            if (proj.id) await handleUpdate(proj.id, proj);
            else await handleCreate(proj);
          }}
          onCancel={() => {
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProjectForm({ wardCode, project = {}, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: "",
    status: "Pending",
    start_date: "",
    location: "",
    description: "",
    is_published: false,
    ...project,
  }));

  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState("A");

  const projectId = form.id || null;

  useEffect(() => {
    setForm({ 
      title: "", 
      status: "pending", 
      start_date: "", 
      location: "",
      description: "",
      is_published: false,
      ...project 
    });
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      // Form closing is handled in the parent after successful save
    } catch (error) {
      // Error is handled by parent, we just need to stop loading
    } finally {
      setSaving(false);
    }
  };

  const defaultSteps = [
    { key: "A", label: "Setting the Stage", fields: ["community_engagement", "kickoff_notes"] },
    { key: "B", label: "Identifying the Project", fields: ["rationale", "assessment_tools", "route_analysis_report", "wardmap_url"] },
    { key: "C", label: "Coordination & Approval", fields: ["coordination_notes", "agencies_involved", "commencement_letter_url"] },
    { key: "D", label: "Execution & Monitoring", fields: ["progress_notes", "execution_details", "documentation_links"] },
    { key: "E", label: "Final Deliverables", fields: ["learnings", "community_impact", "final_report_url"] },
    { key: "F", label: "Scale-Up & Legacy", fields: ["next_route", "support_to_other_wards", "legacy_notes"] },
  ];

  return (
      <form onSubmit={handleSubmit}>
        <div className={styles.formContent}>
          <div className={styles.formSection}>
            <div className={styles.formRowCompact}>
              <div className={styles.formGroup}>
                <label>Project Title *</label>
                <input
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Title for the project..."
                  rows={1}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Pending">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Proposed">Proposed</option>
                </select>
              </div>
            </div> 

            <div className={styles.formRowCompact}>
              <div className={styles.formGroup}>
                <label>Location *</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Project location"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Project Description</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the project..."
                rows={2}
              />
            </div>
          </div>

          {/* Horizontal Step Navigation */}
          <div className={styles.formSection}>
            {/* Step Tabs */}
            <div className={styles.stepTabs}>
              {defaultSteps.map(step => (
                <button
                  key={step.key}
                  type="button"
                  className={`${styles.stepTab} ${activeStep === step.key ? styles.active : ''}`}
                  onClick={() => setActiveStep(step.key)}
                >
                  <span className={styles.stepNumber}>{step.key}</span>
                  <span className={styles.stepLabel}>{step.label}</span>
                </button>
              ))}
            </div>
            
            {/* Active Step Content */}
            <div className={styles.stepContent}>
              {defaultSteps.map(step => (
                <div 
                  key={step.key} 
                  className={`${styles.stepPanel} ${activeStep === step.key ? styles.active : ''}`}
                >
                  <div className={styles.stepFields}>
                    {step.fields.map(field => (
                      <div key={field} className={styles.formGroup}>
                        <label>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        {field.includes('_url') ? (
                          <input
                            type="url"
                            value={form[field] || ""}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            placeholder={`Paste URL`}
                          />
                        ) : (
                          <textarea
                            value={form[field] || ""}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                            rows={3}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Image Manager for this step */}
                  {projectId && (
                    <ProjectFileManager
                      projectId={projectId}
                      wardCode={wardCode}
                      step={step.key}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <ButtonGroup>
          <SaveButton saving={saving} type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Project'}
          </SaveButton>
          <CancelButton onClick={onCancel}/>
        </ButtonGroup>
      </form>
  );
}