// pages/admin/ward/[wardCode]/project/[action]/[id].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AdminProvider } from "context/AdminContext";
import { WardProvider } from "context/WardContext";
import { useAdmin } from "context/AdminContext";
import { useAdminWardProjects } from "hooks/useWardData";
import useWardCRUD from "hooks/useWardCRUD";
import { useAlert } from "hooks/useAlert";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { SaveButton, CancelButton } from "components/shared/ui/Buttons";
import ProjectContentEditor from "components/admin/ProjectContentEditor";
import ProjectFileManager from "components/admin/ProjectFileManager";
import AdminLayout from "components/admin/AdminLayout";
import styles from "styles/tabs/project.module.css";

// Main page component with providers
export default function ProjectFormPage() {
  const router = useRouter();
  const { wardCode, action, id } = router.query;

  // Don't render until we have wardCode
  if (!wardCode) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <WardProvider wardCode={wardCode}>
      <AdminProvider wardCode={wardCode}>
        <AdminLayout wardCode={wardCode} activeTab="project">
          <ProjectFormContent wardCode={wardCode} action={action} id={id} />
        </AdminLayout>
      </AdminProvider>
    </WardProvider>
  );
}

// Inner component that uses the hooks
function ProjectFormContent({ wardCode, action, id }) {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const { data: projects } = useAdminWardProjects(wardCode);
  const { create, update } = useWardCRUD("ward_project", wardCode);

  const [form, setForm] = useState({
    title: "",
    status: "Pending",
    start_date: "",
    end_date: "",
    location: "",
    description: "",
    is_published: false,
    // Step content with Editor.js
    community_engagement: { blocks: [] },
    kickoff_notes: { blocks: [] },
    rationale: { blocks: [] },
    assessment_tools: { blocks: [] },
    route_analysis_report: { blocks: [] },
    wardmap_url: { blocks: [] },
    coordination_notes: { blocks: [] },
    agencies_involved: { blocks: [] },
    commencement_letter_url: { blocks: [] },
    progress_notes: { blocks: [] },
    execution_details: { blocks: [] },
    documentation_links: { blocks: [] },
    learnings: { blocks: [] },
    community_impact: { blocks: [] },
    final_report_url: { blocks: [] },
    next_route: { blocks: [] },
    support_to_other_wards: { blocks: [] },
    legacy_notes: { blocks: [] },
  });
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState("A");

  const isEdit = action === "edit";
  const project = isEdit ? projects?.find(p => p.id === id) : null;

  useEffect(() => {
    if (isEdit && project) {
      setForm({
        title: project.title || "",
        status: project.status || "Pending",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        location: project.location || "",
        description: project.description || "",
        is_published: project.is_published || false,
        community_engagement: project.community_engagement || { blocks: [] },
        kickoff_notes: project.kickoff_notes || { blocks: [] },
        rationale: project.rationale || { blocks: [] },
        assessment_tools: project.assessment_tools || { blocks: [] },
        route_analysis_report: project.route_analysis_report || { blocks: [] },
        wardmap_url: project.wardmap_url || { blocks: [] },
        coordination_notes: project.coordination_notes || { blocks: [] },
        agencies_involved: project.agencies_involved || { blocks: [] },
        commencement_letter_url: project.commencement_letter_url || { blocks: [] },
        progress_notes: project.progress_notes || { blocks: [] },
        execution_details: project.execution_details || { blocks: [] },
        documentation_links: project.documentation_links || { blocks: [] },
        learnings: project.learnings || { blocks: [] },
        community_impact: project.community_impact || { blocks: [] },
        final_report_url: project.final_report_url || { blocks: [] },
        next_route: project.next_route || { blocks: [] },
        support_to_other_wards: project.support_to_other_wards || { blocks: [] },
        legacy_notes: project.legacy_notes || { blocks: [] },
      });
    }
  }, [isEdit, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEdit) {
        await update(id, form);
        showSuccessAlert({ message: "Project updated successfully!" });
      } else {
        await create(form);
        showSuccessAlert({ message: "Project created successfully!" });
      }
      router.push(`/admin/ward/${wardCode}/project`);
    } catch (error) {
      showErrorAlert({ 
        message: `Failed to ${isEdit ? 'update' : 'create'} project`, 
        errorDetails: error.message 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditorChange = (field) => (content) => {
    setForm(prev => ({ ...prev, [field]: content }));
  };

  const defaultSteps = [
    { 
      key: "A", 
      label: "Setting the Stage", 
      fields: [
        { key: "community_engagement", label: "Community Engagement" },
        { key: "kickoff_notes", label: "Kickoff Notes" }
      ] 
    },
    { 
      key: "B", 
      label: "Identifying the Project", 
      fields: [
        { key: "rationale", label: "Rationale" },
        { key: "assessment_tools", label: "Assessment Tools" },
        { key: "route_analysis_report", label: "Route Analysis Report" },
        { key: "wardmap_url", label: "Wardmap URL" }
      ] 
    },
    { 
      key: "C", 
      label: "Coordination & Approval", 
      fields: [
        { key: "coordination_notes", label: "Coordination Notes" },
        { key: "agencies_involved", label: "Agencies Involved" },
        { key: "commencement_letter_url", label: "Commencement Letter URL" }
      ] 
    },
    { 
      key: "D", 
      label: "Execution & Monitoring", 
      fields: [
        { key: "progress_notes", label: "Progress Notes" },
        { key: "execution_details", label: "Execution Details" },
        { key: "documentation_links", label: "Documentation Links" }
      ] 
    },
    { 
      key: "E", 
      label: "Final Deliverables", 
      fields: [
        { key: "learnings", label: "Learnings" },
        { key: "community_impact", label: "Community Impact" },
        { key: "final_report_url", label: "Final Report URL" }
      ] 
    },
    { 
      key: "F", 
      label: "Scale-Up & Legacy", 
      fields: [
        { key: "next_route", label: "Next Route" },
        { key: "support_to_other_wards", label: "Support to Other Wards" },
        { key: "legacy_notes", label: "Legacy Notes" }
      ] 
    },
  ];

  // Show loading while checking admin permissions
  if (adminLoading) {
    return <div className={styles.loading}>Checking permissions...</div>;
  }

  if (!isAdmin) {
    return (
      <div className={styles.errorMessage}>
        You don't have access to manage projects.
      </div>
    );
  }

  return (
    <div className={styles.projectFormPage}>
      <AlertComponent />
      
      <div className={styles.pageHeader}>
        <h1>{isEdit ? "Edit Project" : "Create New Project"}</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.projectForm}>
        {/* Basic Info Section */}
        <div className={styles.formSection}>
          <h2>Basic Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Project Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Project title..."
                required
              />
            </div>
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
            <div className={styles.formGroup}>
              <label>Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Project location"
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Project Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the project..."
              rows={3}
            />
          </div>
        </div>

        {/* Step Content with Editor.js */}
        <div className={styles.formSection}>
          <h2>Project Details</h2>
          
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
          
          <div className={styles.stepContent}>
            {defaultSteps.map(step => (
              <div 
                key={step.key} 
                className={`${styles.stepPanel} ${activeStep === step.key ? styles.active : ''}`}
              >
                {step.fields.map(field => (
                  <div key={field.key} className={styles.editorSection}>
                    <h4>{field.label}</h4>
                    <ProjectContentEditor
                      content={form[field.key]}
                      onChange={handleEditorChange(field.key)}
                      placeholder={`Write ${field.label.toLowerCase()}...`}
                    />
                  </div>
                ))}
                
                {/* File Manager for this step */}
                {isEdit && (
                  <ProjectFileManager
                    projectId={id}
                    wardCode={wardCode}
                    step={step.key}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <ButtonGroup>
          <SaveButton saving={saving} type="submit" disabled={saving}>
            {saving ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
          </SaveButton>
          <CancelButton 
            onClick={() => router.push(`/admin/ward/${wardCode}/project`)}
          />
        </ButtonGroup>
      </form>
    </div>
  );
}