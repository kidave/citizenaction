// components/admin/tabs/ProjectAdmin.js
import { useState, useEffect } from "react";
import { useAdmin } from "context/AdminContext";
import { useAdminWardProjects } from "hooks/useWardData";
import useWardCRUD from "hooks/useWardCRUD";
import { useAlert } from "hooks/useAlert";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { 
  AddButton, 
  EditButton, 
  DeleteButton, 
  SaveButton, 
  CancelButton,
  PublishButton
} from "components/shared/ui/Buttons";
import ProjectImageManager from "components/admin/ProjectImageManager";
import styles from "styles/tabs/project.module.css";

export default function ProjectAdmin({ wardId }) {
  const { isAdmin } = useAdmin();
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const { data: projects, loading, error, refresh } = useAdminWardProjects(wardId);
  const { create, update, remove } = useWardCRUD("project", wardId); // Remove publish

  const [editing, setEditing] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [publishingStates, setPublishingStates] = useState({});

  const handleCreate = async (projectData) => {
    try {
      setSaveError(null);
      const cleanData = Object.fromEntries(
        Object.entries(projectData).filter(([_, v]) => v !== undefined && v !== null)
      );
      const created = await create(cleanData);
      setEditing(created);
      await refresh();
      return created;
    } catch (err) {
      setSaveError(err.message);
      throw err;
    }
  };

  const handleUpdate = async (id, projectData) => {
    try {
      setSaveError(null);
      const cleanData = Object.fromEntries(
        Object.entries(projectData).filter(([_, v]) => v !== undefined && v !== null)
      );
      await update(id, cleanData);
      await refresh();
    } catch (err) {
      setSaveError(err.message);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    showConfirmAlert({
      title: "Delete Project?",
      message: "This will remove the project and all its images.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(id);
          if (editing && editing.id === id) setEditing(null);
          await refresh();
        } catch (err) {
          setSaveError(err.message);
        }
      }
    });
  };

  const handlePublish = async (projectId, publishState) => {
    try {
      setPublishingStates(prev => ({ ...prev, [projectId]: true }));
      // Use update function to change is_published status
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
      {saveError && <div className={styles.errorMessage}>Error: {saveError}</div>}

      {loading ? (
        <div className={styles.loading}>Loading projects...</div>
      ) : (!projects || projects.length === 0) && !editing ? ( // Add null check for projects
        <div className={styles.emptyState}>
          <p>No projects found. Create your first project to get started.</p>
        </div>
      ) : (
        <div className={styles.projectList}>
          {projects?.map((project) => ( 
            <div key={project.id} className={styles.adminItem}>
              <div className={styles.adminItemHeader}>
                <div className={styles.adminItemTitle}>
                  <h4>{project.title || "Untitled Project"}</h4>
                  <div className={styles.projectMeta}>
                    <h5>{project.is_published ? 'Published' : 'Draft'}</h5>
                  </div>
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
          wardId={wardId}
          project={editing}
          onSave={async (proj) => {
            if (proj.id) await handleUpdate(proj.id, proj);
            else await handleCreate(proj);
          }}
          onCancel={() => {
            setEditing(null);
            setSaveError(null);
          }}
        />
      )}
    </div>
  );
}

function ProjectForm({ wardId, project = {}, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: "",
    status: "pending",
    start_date: "",
    end_date: "",
    location: "",
    description: "",
    is_published: false,
    custom_sections: [],
    ...project,
  }));

  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState("A"); // Start with first step active
  const [newSection, setNewSection] = useState({ key: "", label: "", content: "" });

  const projectId = form.id || null;

  useEffect(() => {
    setForm({ 
      title: "", 
      status: "pending", 
      start_date: "", 
      end_date: "", 
      location: "",
      description: "",
      is_published: false,
      custom_sections: [],
      ...project 
    });
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const addCustomSection = () => {
    if (newSection.key && newSection.label) {
      setForm(prev => ({
        ...prev,
        custom_sections: [...prev.custom_sections, { ...newSection }]
      }));
      setNewSection({ key: "", label: "", content: "" });
    }
  };

  const removeCustomSection = (index) => {
    setForm(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.filter((_, i) => i !== index)
    }));
  };

  const updateCustomSection = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    }));
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
    <div className={styles.projectFormOverlay}>
      <div className={styles.projectFormBackdrop} onClick={onCancel}></div>
      <form onSubmit={handleSubmit} className={styles.projectForm}>
        <div className={styles.formHeader}>
          <h3>{projectId ? "Edit Project" : "New Project"}</h3>
          <ButtonGroup>
            <SaveButton saving={saving} type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Project'}
            </SaveButton>
            <CancelButton type="button" onClick={onCancel}>
              Cancel
            </CancelButton>
          </ButtonGroup>
        </div>

        <div className={styles.formContent}>
          {/* Basic Information Section - Updated Layout */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h4>Basic Information</h4>
            </div>
            <div className={styles.formGridCompact}>
              <div className={styles.formGroup}>
                <label>Project Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div className={styles.formRowCompact}>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="pending">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Location *</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Project location"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formRowCompact}>
                <div className={styles.formGroup}>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Project Description</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the project..."
                rows={3}
              />
            </div>
          </div>

          {/* Horizontal Step Navigation */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h4>Project Details</h4>
            </div>
            
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
                            placeholder={`Enter ${field.replace('_url', ' URL')}`}
                          />
                        ) : (
                          <textarea
                            value={form[field] || ""}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                            rows={4}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Image Manager for this step */}
                  {projectId && (
                    <ProjectImageManager
                      projectId={projectId}
                      wardId={wardId}
                      step={step.key}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Sections */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h4>Custom Sections</h4>
            </div>
            
            <div className={styles.customSectionCreator}>
              <div className={styles.creatorForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Section Key</label>
                    <input
                      value={newSection.key}
                      onChange={(e) => setNewSection({ ...newSection, key: e.target.value.toUpperCase() })}
                      placeholder="A, B, C1, etc."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Section Label</label>
                    <input
                      value={newSection.label}
                      onChange={(e) => setNewSection({ ...newSection, label: e.target.value })}
                      placeholder="Section title"
                    />
                  </div>
                  <ButtonGroup>
                    <AddButton 
                      onClick={addCustomSection} 
                      disabled={!newSection.key || !newSection.label}
                    >
                      Add Section
                    </AddButton>
                  </ButtonGroup>
                </div>
                {newSection.key && newSection.label && (
                  <div className={styles.formGroup}>
                    <label>Section Content</label>
                    <textarea
                      value={newSection.content}
                      onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                      placeholder="Enter section content..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {form.custom_sections.length > 0 && (
              <div className={styles.customSectionsList}>
                {form.custom_sections.map((section, index) => (
                  <div key={index} className={styles.customSectionItem}>
                    <div className={styles.sectionHeader}>
                      <h5>{section.key}. {section.label}</h5>
                      <DeleteButton
                        onClick={() => removeCustomSection(index)}
                      >
                        Delete
                      </DeleteButton>
                    </div>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateCustomSection(index, 'content', e.target.value)}
                      placeholder="Section content..."
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}