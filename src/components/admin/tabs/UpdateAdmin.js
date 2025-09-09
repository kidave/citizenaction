// components/admin/tabs/UpdateAdmin.js
import { useState } from "react";
import useWardUpdates from "hooks/useWardUpdates";
import useWardCRUD from "hooks/useWardCRUD";
import styles from "styles/layout/admin.module.css";

export default function UpdateAdmin({ wardId }) {
  const { updates, loading, error, setUpdates } = useWardUpdates(wardId);
  
  function formatDateToMonthYear(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  const mutate = async () => {
    const res = await fetch(`/api/ward/${wardId}/update/public`);
    const data = await res.json();
    setUpdates(data || []);
  };

  const { create, update, remove } = useWardCRUD("update", wardId, mutate);
  
  const [form, setForm] = useState({
    date: "",
    operation: "",
    description: "",
    support: ""
  });

  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.operation) {
      alert("Date and Operation are required");
      return;
    }

    await create(form);
    setForm({
      date: "",
      operation: "",
      description: "",
      support: ""
    });
  };

  const handleEditSave = async (id, updated) => {
    await update(id, updated);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this Monthly Update permanently?")) {
      await remove(id);
    }
  };

  if (loading) return <p>Loading monthly updates...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.adminPanel}>
      <h2>Manage Monthly Updates</h2>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <textarea
          value={form.operation}
          onChange={(e) => setForm({ ...form, operation: e.target.value })}
          placeholder="List key operations (one per line)"
          rows={3}
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Detailed description"
          rows={3}
        />
        <textarea
          value={form.support}
          onChange={(e) => setForm({ ...form, support: e.target.value })}
          placeholder="Support required (one per line)"
          rows={2}
        />
        <button type="submit">Add Monthly Update</button>
      </form>

      {/* Updates List */}
      <div>
        <h3>Existing Monthly Updates</h3>
        
        {updates.length === 0 ? (
          <p className={styles.emptyMessage}>No monthly updates yet.</p>
        ) : (
          <ul className={styles.adminList}>
            {updates.map((update) => (
              <li key={update.id} className={styles.adminItem}>
                {editingId === update.id ? (
                  <UpdateEditForm
                    update={update}
                    onCancel={() => setEditingId(null)}
                    onSave={(updated) => handleEditSave(update.id, updated)}
                  />
                ) : (
                  <>
                    <div className={styles.adminHeader}>
                      <h4>{formatDateToMonthYear(update.date)}</h4>
                      <div className={styles.adminActions}>
                        <button onClick={() => setEditingId(update.id)}>Edit</button>
                        <button onClick={() => handleDelete(update.id)}>Delete</button>
                      </div>
                    </div>

                    <div className={styles.adminContent}>
                      {update.operation && (
                        <div className={styles.adminSection}>
                          <strong>Operations:</strong>
                          <div className={styles.adminText}>
                            {update.operation.split('\n').map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {update.description && (
                        <div className={styles.adminSection}>
                          <strong>Description:</strong>
                          <div className={styles.adminText}>{update.description}</div>
                        </div>
                      )}
                      
                      {update.support && (
                        <div className={styles.adminSection}>
                          <strong>Support Needed:</strong>
                          <div className={styles.adminText}>
                            {update.support.split('\n').map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function UpdateEditForm({ update, onSave, onCancel }) {
  const [edited, setEdited] = useState({ ...update });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEdited(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.editForm}>

        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={edited.date}
          onChange={handleChange}
          required
        />

        <label>Operations:</label>
        <textarea
          name="operation"
          value={edited.operation}
          onChange={handleChange}
          rows={3}
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={edited.description}
          onChange={handleChange}
          rows={3}
        />

        <label>Support Needed:</label>
        <textarea
          name="support"
          value={edited.support}
          onChange={handleChange}
          rows={2}
        />


      <div className={styles.formActions}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}