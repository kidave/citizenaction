// components/shared/MeetingForm.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "styles/layout/admin.module.css";

export default function MeetingForm({ meeting, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    notable_attendees: "",
    discussion: "",
    mood_rating: 5,
  });

  useEffect(() => {
    if (meeting) {
      setForm({
        title: meeting.title || "",
        date: meeting.date ? new Date(meeting.date).toISOString().split('T')[0] : "",
        location: meeting.location || "",
        notable_attendees: meeting.notable_attendees || "",
        discussion: meeting.discussion || "",
        mood_rating: meeting.mood_rating || 5,
      });
    }
  }, [meeting]);

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
        <label>Title:</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <label>Location:</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
        />
        <label>Notable Attendees:</label>
        <input
          name="notable_attendees"
          value={form.notable_attendees}
          onChange={handleChange}
          placeholder="Notable Attendees"
        />
        <label>Discussion Points:</label>
        <textarea
          name="discussion"
          value={form.discussion}
          onChange={handleChange}
          placeholder="Discussion (one point per line)"
          rows="4"
        />
        <label>
          Mood Rating: {form.mood_rating}
          <input
            type="range"
            name="mood_rating"
            min="1"
            max="10"
            value={form.mood_rating}
            onChange={handleChange}
          />
        </label>
        <div className={styles.formActions}>
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}