// components/shared/UpdateForm.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "styles/layout/admin.module.css";

export default function UpdateForm({ update, onSave, onCancel }) {
  const [form, setForm] = useState({
    date: "",
    operation: "",
    description: "",
    support: "",
  });

  useEffect(() => {
    if (update) {
      setForm({
        date: update.date ? new Date(update.date).toISOString().split('T')[0] : "",
        operation: update.operation || "",
        description: update.description || "",
        support: update.support || "",
      });
    }
  }, [update]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={styles.editFormContainer}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <label>Key Operations:</label>
        <textarea
          name="operation"
          value={form.operation}
          onChange={handleChange}
          placeholder="Key Operations (one per line)"
          rows="3"
        />
        <label>Description:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description (one per line)"
          rows="3"
        />
        <label>Support Needed:</label>
        <textarea
          name="support"
          value={form.support}
          onChange={handleChange}
          placeholder="Support Needed (one per line)"
          rows="3"
        />
        <div className={styles.formActions}>
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}