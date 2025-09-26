// components/admin/tabs/ProjectAdmin.js
import { useState, useEffect } from "react";
import { useAdmin } from "context/AdminContext";
import { useAuth } from "context/AuthContext";
import useAdminProjects from "hooks/useAdminProjects";
import useWardCRUD from "hooks/useWardCRUD";
import useProjectImages from "hooks/useProjectImages";
import { useAlert } from "hooks/useAlert";
import { AddButton, EditButton, DeleteButton, SaveButton, CancelButton } from "components/shared/ui/Buttons";
import styles from "styles/layout/project.module.css";
import { FiTrash2 } from "react-icons/fi";

export default function ProjectAdmin({ wardId }) {
  const { isAdmin } = useAdmin();
  const { getAccessToken } = useAuth();
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const { projects, loading, error, refresh } = useAdminProjects(wardId);
  const { create, update, remove } = useWardCRUD("project", wardId);

  const [editing, setEditing] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const handleCreate = async (projectData) => {
    try {
      setSaveError(null);
      const cleanData = Object.fromEntries(
        Object.entries(projectData).filter(([_, v]) => v !== undefined && v !== null)
      );
      const created = await create(cleanData);
      setEditing(created);
      showSuccessAlert({ title: "Created!", message: "Project created successfully." });
      await refresh();
      return created;
    } catch (err) {
      setSaveError(err.message);
      showErrorAlert({ message: "Failed to create project", errorDetails: err.message });
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

      const token = await getAccessToken();
      const res = await fetch(`/api/ward/${wardId}/project/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setEditing(updated);
      }
      showSuccessAlert({ title: "Updated!", message: "Project updated successfully." });
      await refresh();
    } catch (err) {
      setSaveError(err.message);
      showErrorAlert({ message: "Failed to update project", errorDetails: err.message });
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
          showSuccessAlert({ title: "Deleted!", message: "Project deleted successfully." });
        } catch (err) {
          setSaveError(err.message);
          showErrorAlert({ message: "Failed to delete project", errorDetails: err.message });
        }
      }
    });
  };

  if (!isAdmin) {
    showErrorAlert({ message: "You don't have access to manage projects." });
    return (
      <div className={styles.adminPanel}>
        <div className={styles.errorMessage}>
          You don't have access to manage projects.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPanel}>
      <AlertComponent />
      <div className={styles.adminHeader}>
        <AddButton
          onClick={() => setEditing({})}
          disabled={loading}
          size="large"
        >
          {loading ? "Loading..." : "New Project"}
        </AddButton>
      </div>

      {error && showErrorAlert({ message: `Error: ${error}` })}
      {saveError && showErrorAlert({ message: `Error: ${saveError}` })}

      {loading ? (
        <div className={styles.loading}>Loading projects...</div>
      ) : projects.length === 0 && !editing ? (
        <div className={styles.emptyState}>
          <p>No projects found. Create your first project to get started.</p>
        </div>
      ) : (
        <div className={styles.projectList}>
          {projects.map((p) => (
            <div key={p.id} className={styles.adminItem}>
              <div className={styles.adminItemHeader}>
                <div className={styles.adminItemTitle}>{p.title || "Untitled Project"}</div>
                <div className={styles.adminItemActions}>
                  <EditButton 
                    size="small" 
                    onClick={() => setEditing(p)}
                  >
                    Edit
                  </EditButton>
                  <DeleteButton
                    size="small"
                    variant="danger"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </DeleteButton>
                </div>
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

/* ----------------- Project Form ----------------- */
function ProjectForm({ wardId, project = {}, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: "",
    status: "planned",
    start_date: "",
    end_date: "",
    location: "",
    ...project,
  }));

  const [saving, setSaving] = useState(false);
  const [uploadType, setUploadType] = useState("stack");
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [confirmFileDelete, setConfirmFileDelete] = useState(null);
  const [success, setSuccess] = useState(null);

  const projectId = form.id || null;
  const { images, loading: imagesLoading, upload, remove: removeImage, resolveUrl, refresh } =
    useProjectImages(wardId, projectId);

  useEffect(() => {
    setForm({ title: "", status: "planned", start_date: "", end_date: "", location: "", ...project });
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSuccess({ title: "Saved!", message: "Project saved successfully." });
    setSaving(false);
  };

  const handleMultipleFileUpload = async (files, step, type) => {
    if (!files?.length || !projectId) return;
    setUploadingFiles((prev) => ({ ...prev, [step]: true }));
    try {
      await Promise.all(
        Array.from(files).map((f) =>
          upload(f, step, type).catch(() => ({ error: f.name }))
        )
      );
      await refresh();
      setSuccess({ title: "Uploaded!", message: `${files.length} file(s) uploaded.` });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [step]: false }));
    }
  };

  const steps = [
    { key: "A", label: "Setting the Stage", fields: [{ name: "community_engagement", label: "Community Engagement", type: "textarea" }, { name: "kickoff_notes", label: "Kickoff Notes", type: "textarea" }] },
    { key: "B", label: "Identifying the Project", fields: [{ name: "rationale", label: "Rationale", type: "textarea" }, { name: "assessment_tools", label: "Assessment Tools", type: "textarea" }, { name: "route_analysis_report", label: "Route Analysis Report", type: "textarea" }, { name: "wardmap_url", label: "Ward Map URL", type: "url" }] },
    { key: "C", label: "Coordination & Approval", fields: [{ name: "coordination_notes", label: "Coordination Notes", type: "textarea" }, { name: "agencies_involved", label: "Agencies Involved", type: "textarea" }, { name: "commencement_letter_url", label: "Commencement Letter URL", type: "url" }] },
    { key: "D", label: "Execution & Monitoring", fields: [{ name: "progress_notes", label: "Progress Notes", type: "textarea" }, { name: "execution_details", label: "Execution Details", type: "textarea" }, { name: "documentation_links", label: "Documentation Links", type: "url" }] },
    { key: "E", label: "Final Deliverables & Learnings", fields: [{ name: "learnings", label: "Learnings", type: "textarea" }, { name: "community_impact", label: "Community Impact", type: "textarea" }, { name: "final_report_url", label: "Final Report URL", type: "url" }] },
    { key: "F", label: "Scale-Up & Legacy", fields: [{ name: "next_route", label: "Next Route", type: "text" }, { name: "support_to_other_wards", label: "Support to Other Wards", type: "textarea" }, { name: "legacy_notes", label: "Legacy Notes", type: "textarea" }] },
  ];

  return (
    <div className={styles.projectFormOverlay}>
      <div className={styles.projectFormBackdrop} onClick={onCancel}></div>
      <form onSubmit={handleSubmit} className={styles.projectForm}>
        <h3>{projectId ? "Edit Project" : "New Project"}</h3>

        {/* Basic Info */}
        <div className={styles.formSection}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Location *</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
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

        {/* Steps */}
        {steps.map((s) => (
          <div key={s.key} className={styles.formSection}>
            <h4>{s.key}. {s.label}</h4>
            {s.fields.map((f) => (
              <div key={f.name} className={styles.formGroup}>
                <label>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    value={form[f.name] || ""}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                ) : (
                  <input
                    type={f.type}
                    value={form[f.name] || ""}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                )}
              </div>
            ))}

            {projectId && (
              <div className={styles.uploadSection}>
                <h5>Upload Files</h5>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="stack">Image Stack</option>
                  <option value="comparison-before">Before Images</option>
                  <option value="comparison-after">After Images</option>
                  <option value="document">Document</option>
                </select>
                <input
                  type="file"
                  multiple
                  accept={uploadType === "document" ? ".pdf,.doc,.docx" : "image/*"}
                  onChange={(e) =>
                    handleMultipleFileUpload(e.target.files, s.key, uploadType)
                  }
                  disabled={uploadingFiles[s.key]}
                />
                {uploadingFiles[s.key] && <div>Uploading...</div>}
              </div>
            )}
          </div>
        ))}

        <div className={styles.formActions}>
          <SaveButton saving={saving} type="submit" disabled={saving}>
            Save Project
          </SaveButton>
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
        </div>

        {/* Uploaded files */}
        {projectId && (
          <div className={styles.uploadedFiles}>
            <h4>Uploaded Files</h4>
            {imagesLoading ? (
              <div>Loading...</div>
            ) : (
              <div className={styles.fileGrid}>
                {images.map((img) => (
                  <div key={img.id} className={styles.fileItem}>
                    {img.type === "document" ? (
                      <a href={resolveUrl(img.path)} target="_blank" rel="noreferrer">
                        {img.path.split("/").pop()}
                      </a>
                    ) : (
                      <img src={resolveUrl(img.path)} alt={img.path} />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmFileDelete({
                          title: "Delete File?",
                          message: `Remove ${img.path.split("/").pop()}?`,
                          onConfirm: async () => {
                            await removeImage(img);
                            await refresh();
                            setConfirmFileDelete(null);
                          },
                          onCancel: () => setConfirmFileDelete(null),
                        })
                      }
                      className={styles.deleteFileButton}
                    >
                    <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}