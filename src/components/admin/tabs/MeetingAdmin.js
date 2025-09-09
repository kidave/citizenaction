// components/admin/tabs/MeetingAdmin.js
import { useState } from "react";
import useWardMeetings from "hooks/useWardMeetings";
import useWardCRUD from "hooks/useWardCRUD";
import styles from "styles/layout/admin.module.css";
import MeetingImagesAdmin from "components/admin/tabs/MeetingImagesAdmin";

export default function MeetingAdmin({ wardId }) {
  const { meetings, loading, error, setMeetings } = useWardMeetings(wardId);

  const mutate = async () => {
    const res = await fetch(`/api/ward/${wardId}/meeting/public`);
    const data = await res.json();
    setMeetings(data || []);
  };

  const { create, update, remove } = useWardCRUD("meeting", wardId, mutate);

  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    notable_attendees: "",
    discussion: "",
    mood_rating: 5,
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      alert("Title and Date are required");
      return;
    }
    await create(form);
    setForm({
      title: "",
      date: "",
      location: "",
      notable_attendees: "",
      discussion: "",
      mood_rating: 5,
    });
  };

  const handleEditSave = async (id, updated) => {
    if (window.confirm("Update this meeting?")) {
      await update(id, updated);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this meeting permanently?")) {
      await remove(id);
    }
  };

  if (loading) return <p>Loading meetings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.adminPanel}>
      <h2>Manage Meetings</h2>

      {/* Create form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Location"
        />
        <input
          value={form.notable_attendees}
          onChange={(e) =>
            setForm({ ...form, notable_attendees: e.target.value })
          }
          placeholder="Notable Attendees"
        />
        <textarea
          value={form.discussion}
          onChange={(e) => setForm({ ...form, discussion: e.target.value })}
          placeholder="Discussion (one per line)"
        />
        <label>
          Mood Rating: {form.mood_rating}
          <input
            type="range"
            min="1"
            max="10"
            value={form.mood_rating}
            onChange={(e) =>
              setForm({ ...form, mood_rating: Number(e.target.value) })
            }
          />
        </label>
        <button type="submit">Add Meeting</button>
      </form>

      {/* List */}
      <div>
        <h3>Existing Meetings</h3>
        
        {meetings.length === 0 ? (
          <p className={styles.emptyMessage}>No meetings yet.</p>
        ) : (
          <ul className={styles.adminList}>
            {meetings.map((m) => (
              <li key={m.id} className={styles.adminItem}>
                {editingId === m.id ? (
                  <MeetingEditForm
                    meeting={m}
                    onCancel={() => setEditingId(null)}
                    onSave={(updated) => handleEditSave(m.id, updated)}
                  />
                ) : (
                  <>
                    <div className={styles.adminHeader}>
                      <strong>{m.title}</strong>
                      <span>{m.date}</span>
                    </div>
                    <div className={styles.adminActions}>
                      <button onClick={() => setEditingId(m.id)}>Edit</button>
                      <button onClick={() => handleDelete(m.id)}>Delete</button>
                    </div>
                    <MeetingImagesAdmin meetingId={m.id} wardId={wardId} />
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

function MeetingEditForm({ meeting, onSave, onCancel }) {
  const [edited, setEdited] = useState({ ...meeting });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEdited((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.editForm}>

      <label>Title</label>
      <input name="title" value={edited.title || ""} onChange={handleChange} />

      <label>Date</label>
      <input type="date" name="date" value={edited.date || ""} onChange={handleChange} />

      <label>Location</label>
      <input name="location" value={edited.location || ""} onChange={handleChange} />
      
      <label>Notable Attendees</label>
      <input name="notable_attendees" value={edited.notable_attendees || ""} onChange={handleChange} />

      <label>Discussion</label>
      <textarea
        name="discussion"
        value={edited.discussion || ""}
        onChange={handleChange}
      />
      
      <label>Mood Rating</label>
      <input
        type="range"
        name="mood_rating"
        min="1"
        max="10"
        value={edited.mood_rating || 5}
        onChange={handleChange}
      />
      <div className={styles.formActions}>
        <button onClick={() => onSave(edited)}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
