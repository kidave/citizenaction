// components/admin/tabs/CommitteeAdmin.js
import { useState } from "react";
import { useAdmin } from "context/AdminContext";
import { useAlert } from "hooks/useAlert";
import { useCommitteeForms, useCommitteeMembers, useScopes } from "hooks/useCommitteeData";
import CommitteeForm from "components/shared/card/CommitteeForm";
import CommitteeMember from "components/shared/card/CommitteeMember";
import CommitteeManagement from "components/shared/card/CommitteeManagement";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { AddButton } from "components/shared/ui/Buttons";
import styles from "styles/tabs/committee.module.css";

export default function CommitteeAdmin() {
  const { isAdmin } = useAdmin();
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();
  
  // Committee forms (applications)
  const { 
    data: forms, 
    loading: formsLoading, 
    error: formsError, 
    refresh: refreshForms,
    assignMember
  } = useCommitteeForms();

  // Committee members (already assigned)
  const { 
    data: members, 
    loading: membersLoading, 
    error: membersError, 
    refresh: refreshMembers,
    updateMember,
    removeMember 
  } = useCommitteeMembers();

  const { data: scopes } = useScopes('ward'); // Default to ward scopes

  const [processingId, setProcessingId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const handleAssignment = async (assignmentData) => {
    setProcessingId(assignmentData.formId);
    try {
      await assignMember(assignmentData);
      showSuccessAlert({ message: "Committee member assigned successfully!" });
      setShowAssignModal(false);
      setSelectedForm(null);
      await refreshForms();
      await refreshMembers();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to assign committee member", 
        errorDetails: err.message 
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateMember = async (memberId, updateData) => {
    setProcessingId(memberId);
    try {
      await updateMember(memberId, updateData);
      showSuccessAlert({ message: "Committee member updated successfully!" });
      await refreshMembers();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to update committee member", 
        errorDetails: err.message 
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setProcessingId(memberId);
    showConfirmAlert({
      title: "Remove Committee Member",
      message: "Are you sure you want to remove this committee member?",
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await removeMember(memberId);
          showSuccessAlert({ message: "Committee member removed successfully!" });
          await refreshMembers();
        } catch (err) {
          showErrorAlert({ 
            message: "Failed to remove committee member", 
            errorDetails: err.message 
          });
        } finally {
          setProcessingId(null);
        }
      },
      onCancel: () => {
        setProcessingId(null);
      }
    });
  };

  if (!isAdmin) {
    return (
      <div className={styles.adminPanel}>
        <AlertComponent />
        <div className={styles.errorMessage}>
          You don't have access to manage committee applications.
        </div>
      </div>
    );
  }

  const loading = formsLoading || membersLoading;
  const error = formsError || membersError;

  if (loading) return <div className={styles.loading}>Loading committee data...</div>;
  if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

  const pendingForms = forms?.filter(form => form.application_status === 'pending') || [];
  const approvedForms = forms?.filter(form => form.application_status === 'approved') || [];

  return (
    <>
      <AlertComponent />

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Applications ({pendingForms.length})
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'approved' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Applications ({approvedForms.length})
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'members' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Committee Members ({members?.length || 0})
        </button>
      </div>

      {/* Pending Applications Tab */}
      {activeTab === 'pending' && (
        <div className={styles.tabContent}>
          {pendingForms.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Pending Applications</h3>
              <p>All committee applications have been processed.</p>
            </div>
          ) : (
            <div className={styles.formsGrid}>
              {pendingForms.map((form) => (
                <CommitteeForm
                  key={form.id}
                  form={form}
                  onAssign={() => {
                    setSelectedForm(form);
                    setShowAssignModal(true);
                  }}
                  processing={processingId === form.id}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Applications Tab */}
      {activeTab === 'approved' && (
        <div className={styles.tabContent}>
          {approvedForms.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Approved Applications</h3>
              <p>No committee applications have been approved yet.</p>
            </div>
          ) : (
            <div className={styles.formsGrid}>
              {approvedForms.map((form) => (
                <CommitteeForm
                  key={form.id}
                  form={form}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Committee Members Tab */}
      {activeTab === 'members' && (
        <div className={styles.tabContent}>
          {members && members.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Committee Members</h3>
              <p>Start by approving applications from the Pending Applications tab.</p>
              <AddButton
                variant="outline"
                onClick={() => setActiveTab('pending')}
              >
                View Pending Applications
              </AddButton>
            </div>
          ) : (
            <div className={styles.membersGrid}>
              {members?.map((member) => (
                <CommitteeMember
                  key={member.user_id}
                  member={member}
                  onUpdate={(updateData) => handleUpdateMember(member.user_id, updateData)}
                  onRemove={() => handleRemoveMember(member.user_id)}
                  processing={processingId === member.user_id}
                  scopes={scopes}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedForm && (
        <CommitteeManagement
          form={selectedForm}
          scopes={scopes}
          onAssign={handleAssignment}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedForm(null);
          }}
        />
      )}
    </>
  );
}