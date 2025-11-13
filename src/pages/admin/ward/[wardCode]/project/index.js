// pages/admin/ward/[wardCode]/project/index.js
import { useState } from "react";
import { useRouter } from "next/router";
import { AdminProvider } from "context/AdminContext";
import { WardProvider } from "context/WardContext";
import { useAdmin } from "context/AdminContext";
import { useAdminWardProjects } from "hooks/useWardData";
import useWardCRUD from "hooks/useWardCRUD";
import { useAlert } from "hooks/useAlert";
import StatusBadge from 'components/shared/card/StatusBadge';
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { AddButton, EditButton, DeleteButton, PublishButton } from "components/shared/ui/Buttons";
import AdminLayout from "components/admin/AdminLayout";
import styles from "styles/tabs/project.module.css";

// Main page component that sets up providers
export default function ProjectAdminPage() {
  const router = useRouter();
  const { wardCode } = router.query;

  return (
    <WardProvider wardCode={wardCode}>
      <AdminProvider wardCode={wardCode}>
        <ProjectAdminContent />
      </AdminProvider>
    </WardProvider>
  );
}

// Inner component that uses the hooks
function ProjectAdminContent() {
  const router = useRouter();
  const { wardCode } = router.query;
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const { data: projects, loading: projectsLoading, error, refresh } = useAdminWardProjects(wardCode);
  const { create, update, remove } = useWardCRUD("ward_project", wardCode);

  const [publishingStates, setPublishingStates] = useState({});
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingProjectId(id);
    showConfirmAlert({
      title: "Delete Project?",
      message: "This will remove the project and all its files.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(id);
          showSuccessAlert({ message: "Project deleted successfully!" });
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

  // Show loading while checking admin permissions
  if (adminLoading) {
    return (
      <AdminLayout wardCode={wardCode} activeTab="project">
        <div className={styles.loading}>Checking permissions...</div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout wardCode={wardCode} activeTab="project">
        <div className={styles.errorMessage}>
          You don't have access to manage projects.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout wardCode={wardCode} activeTab="project">
      <div className={styles.adminPanel}>
        <AlertComponent />
        <ButtonGroup>
          <AddButton
            onClick={() => router.push(`/admin/ward/${wardCode}/project/createproject`)}
            disabled={projectsLoading}
          >
            New Project
          </AddButton>
        </ButtonGroup>

        {error && <div className={styles.errorMessage}>Error: {error}</div>}

        {projectsLoading ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : (!projects || projects.length === 0) ? (
          <div className={styles.emptyState}>
            <p>No projects found. Create your first project to get started.</p>
          </div>
        ) : (
          <div className={styles.adminItem}>
            {projects?.map((project) => ( 
              <div key={project.id} className={styles.projectItem}>
                <div className={styles.cardHeaderRow}>
                  <h3>{project.title || "Untitled Project"}</h3>
                  <StatusBadge 
                    status={project.is_published ? 'published' : 'draft'}
                    variant="badge"
                    customLabel={project.is_published ? 'Published' : 'Draft'}
                  />
                </div>
                
                {project.description && (
                  <p className={styles.projectDescription}>{project.description}</p>
                )}
                
                <div className={styles.cardMeta}>
                  <span>Status: {project.status}</span>
                  {project.start_date && (
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                  )}
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
                    onClick={() => router.push(`/admin/ward/${wardCode}/project/${project.id}/edit`)}
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
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}